import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { UserPermission } from '../entities/user-permission.entity';

const PERMISSION_CACHE_TTL = 60000; // 1 minute

@Injectable()
export class PermissionComputeService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserPermission)
    private readonly userPermRepo: Repository<UserPermission>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  /**
   * Computes effective permissions for a user:
   * effective = role.permissions + user.grants - user.revokes
   *
   * Returns a Set<string> of permission slugs like "assignment:create"
   */
  async getEffectivePermissions(userId: string): Promise<Set<string>> {
    const cacheKey = `user_perms_${userId}`;
    const cached = await this.cacheManager.get<string[]>(cacheKey);

    if (cached) {
      return new Set(cached);
    }

    // 1. Load user with role and role.permissions
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });

    if (!user || !user.role) {
      return new Set();
    }

    // 2. Get role-level permissions
    const rolePermSlugs = user.role.permissions.map((p) => p.slug);

    // 3. Get user-level overrides
    const overrides = await this.userPermRepo.find({
      where: { user: { id: userId } },
      relations: ['permission'],
    });

    const grants = overrides
      .filter((o) => o.type === 'grant')
      .map((o) => o.permission.slug);

    const revokes = new Set(
      overrides
        .filter((o) => o.type === 'revoke')
        .map((o) => o.permission.slug),
    );

    // 4. Compute: (rolePerms ∪ grants) ∖ revokes
    const effective = [...rolePermSlugs, ...grants].filter(
      (slug) => !revokes.has(slug),
    );

    // 5. Cache and return
    await this.cacheManager.set(cacheKey, effective, PERMISSION_CACHE_TTL);

    return new Set(effective);
  }

  /**
   * Invalidate cached permissions for a user.
   * Call this when role/permissions change.
   */
  async invalidateUserPermissions(userId: string): Promise<void> {
    await this.cacheManager.del(`user_perms_${userId}`);
  }
}
