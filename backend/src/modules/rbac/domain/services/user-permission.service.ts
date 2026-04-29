import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { hasPermission, isSuperAdmin } from 'src/common/utils/permissions/permission.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermissionRepository } from '../../data/repository/user-permission.repository';
import { PermissionComputeService } from './permission-compute.service';
import { PersonalInfoRepository } from 'src/modules/users/data/repository/personal-info-repository';
import { Permission } from '../entities/permission.entity';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { UserPermission } from '../entities/user-permission.entity';
import { AuditLoggerService } from 'src/modules/users/domain/services/audit-logger.service';
import { BulkManagePermissionDto } from 'src/modules/rbac/presentation/dto/request/manage-permission.dto';
import {
  AUDIT_ACTIONS,
  PermissionOverrideState,
} from 'src/common/constants/permission.constant';

@Injectable()
export class UserPermissionService {
  constructor(
    private readonly userPermissionRepo: UserPermissionRepository,
    private readonly permissionComputeService: PermissionComputeService,
    private readonly personalInfoRepo: PersonalInfoRepository,
    private readonly auditLogger: AuditLoggerService,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  // ================================

  async bulkSetPermissions(
    targetPersonalInfoId: string,
    dto: BulkManagePermissionDto,
    currentUser: UserResponseDto,
  ) {
    const targetProfile =
      await this.personalInfoRepo.findPersonalInfoById(targetPersonalInfoId);
    if (!targetProfile || !targetProfile.user)
      throw new NotFoundException('Target user profile not found.');

    const targetUserId = targetProfile.user.id;
    const hasGlobalAccess = hasPermission(
      currentUser.permissions,
      'user:manage-global',
    );

    if (!hasGlobalAccess && targetProfile.branch?.id !== currentUser.branchId) {
      throw new ForbiddenException(
        'You can only manage permissions for users in your own branch.',
      );
    }

    for (const item of dto.overrides) {
      if (
        !hasGlobalAccess &&
        !hasPermission(currentUser.permissions, item.permissionSlug)
      ) {
        throw new ForbiddenException(
          `You do not possess '${item.permissionSlug}' to delegate it.`,
        );
      }

      const permissionEntity = await this.permissionRepo.findOne({
        where: { slug: item.permissionSlug },
      });
      if (!permissionEntity) continue;

      const existingOverride =
        await this.userPermissionRepo.findSpecificOverride(
          targetUserId,
          permissionEntity.id,
        );

      // 🚨 Using the Enum constant
      if (item.state === PermissionOverrideState.DEFAULT) {
        if (existingOverride) {
          await this.userPermissionRepo.remove(existingOverride);
        }
      } else {
        if (existingOverride) {
          existingOverride.type = item.state;
          await this.userPermissionRepo.save(existingOverride);
        } else {
          const newOverride = new UserPermission();
          newOverride.user = targetProfile.user;
          newOverride.permission = permissionEntity;
          newOverride.type = item.state;
          await this.userPermissionRepo.save(newOverride);
        }
      }
    }

    await this.permissionComputeService.invalidateUserPermissions(targetUserId);

    // 🚨 Log the standard action, but include the user's typed REASON in the details!
    this.auditLogger.logAction(
      currentUser.id,
      AUDIT_ACTIONS.BULK_UPDATE_PERMISSIONS, // Uses the constant
      targetUserId,
      {
        reason: dto.reason, // 🚨 Stored securely in JSONB
        updates: dto.overrides,
      },
    );

    return { message: 'Permissions successfully updated.' };
  }

  // ================================

  async getPermissionMatrix(
    targetPersonalInfoId: string,
    currentUser: UserResponseDto,
  ) {
    // 1. Fetch Target User and their Role
    const targetProfile =
      await this.personalInfoRepo.findPersonalInfoById(targetPersonalInfoId);
    if (!targetProfile || !targetProfile.user || !targetProfile.user.role) {
      throw new NotFoundException('Target user or role not found.');
    }

    const targetUserId = targetProfile.user.id;
    const targetRole = targetProfile.user.role;

    // 2. PBAC Branch Isolation Check
    const hasGlobalAccess = hasPermission(
      currentUser.permissions,
      'user:manage-global',
    );
    if (!hasGlobalAccess && targetProfile.branch?.id !== currentUser.branchId) {
      throw new ForbiddenException(
        'You can only view permissions for users in your own branch.',
      );
    }

    // 3. Get Base Role Permissions for the Target
    const basePermissions = targetRole.permissions || [];
    const baseSlugs = new Set(basePermissions.map((p) => p.slug));

    // 4. Get Current Overrides for the Target from DB
    //  FIX 1: Using the safe repository method instead of private .repo
    const overrides =
      await this.userPermissionRepo.findOverridesByUserId(targetUserId);

    const revokedSlugs = new Set(
      overrides
        .filter((o) => o.type === PermissionOverrideState.REVOKE)
        .map((o) => o.permission.slug),
    );
    const grantedSlugs = new Set(
      overrides
        .filter((o) => o.type === PermissionOverrideState.GRANT)
        .map((o) => o.permission.slug),
    );

    // 5. Build Section 1: Base Role Permissions
    const section1 = basePermissions.map((perm) => ({
      slug: perm.slug,
      //  FIX 2: Removed perm.name entirely
      isChecked: !revokedSlugs.has(perm.slug),
      currentState: revokedSlugs.has(perm.slug)
        ? PermissionOverrideState.REVOKE
        : PermissionOverrideState.DEFAULT,
    }));

    // 6. Build Section 2: Extra Assignable Permissions
    //  FIX 3: Explicitly typed as Permission[] to prevent the never[] error
    let availableToDelegate: Permission[] = [];

    if (hasGlobalAccess) {
      availableToDelegate = await this.permissionRepo.find();
    } else {
      availableToDelegate = await this.permissionRepo
        .createQueryBuilder('p')
        .where('p.slug IN (:...slugs)', { slugs: currentUser.permissions })
        .getMany();
    }

    const section2 = availableToDelegate
      .filter((perm) => !baseSlugs.has(perm.slug))
      .map((perm) => ({
        slug: perm.slug,
        // 🚨 FIX 2: Removed perm.name entirely
        isChecked: grantedSlugs.has(perm.slug),
        currentState: grantedSlugs.has(perm.slug)
          ? PermissionOverrideState.GRANT
          : PermissionOverrideState.DEFAULT,
      }));

    return {
      targetUser: {
        id: targetUserId,
        role: targetRole.name,
        name: `${targetProfile.firstName} ${targetProfile.lastName}`,
      },
      section1_baseRolePermissions: section1,
      section2_extraAssignablePermissions: section2,
    };
  }
}
