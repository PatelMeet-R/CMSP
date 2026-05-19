import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { UserPermission } from '../entities/user-permission.entity';
import { PERMISSION_CACHE_TTL } from 'src/common/constants/token.constants';

@Injectable()
export class PermissionComputeService {
  private readonly logger = new Logger(PermissionComputeService.name);

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

    // 1. Check Redis cache first
    try {
      const cached = await this.cacheManager.get<string[]>(cacheKey);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return new Set(cached);
      }
    } catch (error: any) {
      // Redis might be down — proceed without cache
      this.logger.warn(`Cache read failed for ${cacheKey}: ${error.message}`);
    }

    // 2. Load user with role AND role.permissions via QueryBuilder
    //    ──────────────────────────────────────────────────────────
    //    WHY NOT findOne({ relations: ['role', 'role.permissions'] }) ?
    //
    //    User.role has { eager: true }. TypeORM's findOne() with a mix
    //    of eager + explicit nested relations is unreliable. The eager
    //    load fetches the Role entity WITHOUT its permissions, and the
    //    nested relation request ('role.permissions') gets silently
    //    swallowed. QueryBuilder bypasses this by explicitly controlling
    //    the SQL JOINs — immune to eager/lazy interference.
    //    ──────────────────────────────────────────────────────────
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user || !user.role) {
      this.logger.warn(`User ${userId} not found or has no role assigned.`);
      return new Set();
    }

    // 3. Super Admin bypass — wildcard permission
    if (user.role.name === 'SUPER_ADMIN') {
      const godMode = ['*:*'];
      await this.safeCache(cacheKey, godMode);
      return new Set(godMode);
    }

    // 4. Get role-level permissions (defensive against null/undefined)
    const rolePermSlugs: string[] = Array.isArray(user.role.permissions)
      ? user.role.permissions
          .map((p) => p.slug)
          .filter((slug): slug is string => !!slug)
      : [];

    this.logger.debug(
      `User ${user.email} | Role: ${user.role.name} | Role perms: ${rolePermSlugs.length}`,
    );

    // 5. Get user-level overrides (grants & revokes)
    const overrides = await this.userPermRepo.find({
      where: { user: { id: userId } },
      relations: ['permission'],
    });

    const grants: string[] = overrides
      .filter((o) => o.type === 'grant' && o.permission?.slug)
      .map((o) => o.permission.slug);

    const revokes = new Set<string>(
      overrides
        .filter((o) => o.type === 'revoke' && o.permission?.slug)
        .map((o) => o.permission.slug),
    );

    // 6. Compute: (rolePerms ∪ grants) ∖ revokes
    const effective = [...rolePermSlugs, ...grants].filter(
      (slug) => !revokes.has(slug),
    );

    // 7. Cache and return
    await this.safeCache(cacheKey, effective);

    return new Set(effective);
  }

  /**
   * Invalidate cached permissions for a user.
   * Call this when role/permissions change.
   */
  async invalidateUserPermissions(userId: string): Promise<void> {
    try {
      await this.cacheManager.del(`user_perms_${userId}`);
    } catch (error) {
      this.logger.warn(`Cache invalidation failed for user ${userId}`);
    }
  }

  /**
   * Safe cache write — doesn't throw if Redis is unavailable.
   */
  private async safeCache(key: string, value: string[]): Promise<void> {
    try {
      await this.cacheManager.set(key, value, PERMISSION_CACHE_TTL);
    } catch (error: any) {
      this.logger.warn(`Cache write failed for ${key}: ${error.message}`);
    }
  }
}
