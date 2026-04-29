import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { UserPermission } from '../entities/user-permission.entity';
import { PERMISSION_CACHE_TTL } from 'src/common/constants/token.constants';

@Injectable()
export class PermissionComputeService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserPermission)
    private readonly userPermRepo: Repository<UserPermission>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Computes effective permissions for a user:
   * effective = role.permissions + user.grants - user.revokes
   *
   * Returns a Set<string> of permission slugs like "assignment:create"
   */
  async getEffectivePermissions(userId: string): Promise<Set<string>> {
    const cacheKey = `user_perms_${userId}`;
    const cached = await this.cacheManager.get<string[]>(cacheKey);

    if (cached && Array.isArray(cached) && cached.length > 0) {
      return new Set(cached);
    }

    // 1. Load user with role and role.permissions
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });

    // const user = await this.userRepo.findOne({
    //   where: { id: userId },
    //   relations: {
    //     role: {
    //       permissions: true, // Uses the object syntax for better clarity in TypeORM
    //     },
    //   },
    // });

    if (!user || !user.role) {
      return new Set();
    }

    if (user.role.name === 'SUPER_ADMIN') {
      const godMode = ['*:*'];
      await this.cacheManager.set(cacheKey, godMode, PERMISSION_CACHE_TTL);
      return new Set(godMode);
    }

    // 2. Get role-level permissions
    // const rolePermSlugs = user.role?.permissions?.map((p) => p.slug);
    const rolePermSlugs: string[] = Array.isArray(user.role.permissions)
      ? user.role.permissions.map((p) => p.slug)
      : [];

    // 3. Get user-level overrides
    const overrides = await this.userPermRepo.find({
      where: { user: { id: userId } },
      relations: ['permission'],
    });

    // const grants: string[] = overrides
    //   .filter((o) => o.type === 'grant')
    //   .map((o) => o.permission.slug);

    const grants: string[] = overrides
      ? overrides
          .filter((o) => o.type === 'grant' && o.permission?.slug)
          .map((o) => o.permission.slug)
      : [];

    const revokesList: string[] = overrides
      ? overrides
          .filter((o) => o.type === 'revoke' && o.permission?.slug)
          .map((o) => o.permission.slug)
      : [];
      
    const revokes = new Set(revokesList);

    // 4. Compute: (rolePerms ∪ grants) ∖ revokes
    const effective = [...rolePermSlugs, ...grants].filter(
      (slug) => slug && !revokes.has(slug),
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
