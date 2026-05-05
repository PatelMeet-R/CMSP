import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { ROLES } from 'src/common/constants/roles.constant';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { RoleRepository } from 'src/modules/rbac/data/repository/roles.repository';
import { Permission } from 'src/modules/rbac/domain/entities/permission.entity';
import { Role } from 'src/modules/rbac/domain/entities/role.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    return this.roleRepository.find();
  }

  async findEntityByRoleId(roleId: string) {
    return this.roleRepository.findEntityById(roleId);
  }

  async findEntityByRoleName(roleName: string) {
    return this.roleRepository.findEntityByName(roleName);
  }

  // =======================================
  async getRolePermissionMatrix(roleId: string) {
    // 1. Fetch the role with its currently assigned permissions
    const role = await this.roleRepository.findEntityById(roleId);
    if (!role) throw new NotFoundException('Role not found');

    const roleWithPerms = await this.permissionRepo.manager.findOne(Role, {
      where: { id: roleId },
      relations: ['permissions'],
    });

    // 2. Fetch ALL system permissions
    const allSystemPermissions = await this.permissionRepo.find();

    // 3. Create a Set of the role's current permission slugs for fast lookup
    const currentRoleSlugs = new Set(
      roleWithPerms?.permissions.map((p) => p.slug) || [],
    );

    // 4. Map the data for the frontend
    const matrix = allSystemPermissions.map((perm) => ({
      id: perm.id,
      slug: perm.slug,
      resource: perm.resource,
      action: perm.action,
      isGranted: currentRoleSlugs.has(perm.slug), // true if the role has it
    }));

    return {
      role: { id: role.id, name: role.name },
      permissions: matrix,
    };
  }

  async updateRolePermissions(roleId: string, permissionSlugs: string[]) {
    // 1. Find the role
    const role = await this.roleRepository.findEntityById(roleId);
    if (!role) throw new NotFoundException('Role not found');

    // Protect SUPER_ADMIN from being accidentally locked out
    if (role.name === ROLES.SUPER_ADMIN) {
      throw new BadRequestException(
        'Super Admin permissions cannot be modified.',
      );
    }

    // 2. Find all the permission entities matching the slugs
    let newPermissions: Permission[] = [];
    if (permissionSlugs.length > 0) {
      newPermissions = await this.permissionRepo.find({
        where: { slug: In(permissionSlugs) },
      });
    }

    // 3. Update the many-to-many relationship and save
    role.permissions = newPermissions;
    await this.permissionRepo.manager.save(role);

    // 4.  CRITICAL CACHE INVALIDATION 🚨
    // Find all users who have this role and wipe their individual permission caches.
    const affectedUsers = await this.userRepo.find({
      where: { role: { id: roleId } },
      select: ['id'],
    });

    const cacheKeysToDelete = affectedUsers.map((u) => `user_perms_${u.id}`);

    // Delete them all from Redis
    if (cacheKeysToDelete.length > 0) {
      await Promise.all(
        cacheKeysToDelete.map((key) => this.cacheManager.del(key)),
      );
    }

    return {
      message: `Successfully updated permissions for ${role.name}. Cache cleared for ${affectedUsers.length} users.`,
    };
  }
  // =======================================
}
