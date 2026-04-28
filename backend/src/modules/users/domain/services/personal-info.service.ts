import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PersonalInfoRepository } from '../../data/repository/personal-info-repository';

import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import { BranchService } from 'src/modules/branch/domain/branch.service';

import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { UpdatePersonalInfoMapper } from 'src/modules/users/data/mapper/users.request,mapper';
import { UpdatePersonalInfoDto } from 'src/modules/users/presentation/dto/request/update-personal-info.dto';
import { PersonalInfoResponseMapper } from 'src/modules/users/data/mapper/users-response.mapper';
import { FindUsersPersonalInfoQueryDto } from 'src/common/pagination/dto/find-users-personal-query.dto';
import {
  ENUM_TYPES,
  ENUM_VALUES,
} from 'src/common/constants/enum-types.constant';
import { AuthRepository } from 'src/modules/auth/data/repository';
import {
  ChangeUserRoleDto,
  ToggleStatusDto,
} from 'src/modules/users/presentation/dto/request/update-User.dto';
import { FileUploadService } from 'src/modules/file-upload/domain/file-upload.service';
import { Inject, forwardRef } from '@nestjs/common';
import { UpdateProfileImageDto } from 'src/modules/users/presentation/dto/request/update-profile-image.dto';
import { RoleService } from 'src/modules/rbac/domain/services/role.service';
import { ApproveUserDto } from 'src/modules/users/presentation/dto/request/approve-user.dto';

@Injectable()
export class PersonalInfoService {
  constructor(
    private readonly personalInfoRepo: PersonalInfoRepository,
    private readonly enumService: EnumService,
    private readonly branchService: BranchService,
    @Inject(forwardRef(() => AuthRepository))
    private readonly authRepository: AuthRepository,
    private readonly fileUploadService: FileUploadService,
    // @Inject(forwardRef(() => RoleService))
    private readonly roleService: RoleService,
  ) {}
  // ================================

  async getPersonalProfileByAuthId(userId: string) {
    const profile =
      await this.personalInfoRepo.getPersonalProfileByAuthId(userId);
    const mappedResponse = PersonalInfoResponseMapper.toResponse(profile);
    return mappedResponse;
  }
  // ================================

  async updateSmartProfile(
    targetProfileId: string,
    dto: UpdatePersonalInfoDto,
    currentUser: UserResponseDto,
  ) {
    // 1. Fetch profile
    const targetProfile =
      await this.personalInfoRepo.findPersonalInfoById(targetProfileId);

    if (!targetProfile) throw new NotFoundException(ERRORMESSAGE.NOT_FOUND);

    const canUpdateOthers = currentUser.permissions.includes('user:update');
    const canUpdateGlobal =
      currentUser.permissions.includes('user:update-global') ||
      currentUser.permissions.includes('*:*');

    const isSelf = targetProfile.user?.id === currentUser.id;

    if (!isSelf && !canUpdateOthers) {
      throw new ForbiddenException(
        "You do not have permission to edit someone else's profile.",
      );
    }

    if (!isSelf && canUpdateOthers && !canUpdateGlobal) {
      if (targetProfile.branch?.id !== currentUser.branchId) {
        throw new ForbiddenException(
          'You can only edit profiles within your own branch.',
        );
      }
    }

    const relations: any = {};
    if (dto.genderId)
      relations.gender = await this.enumService.getEnumValueById(dto.genderId);

    // Only users with 'user:manage-academic' permission can change years/branch/status
    const canManageAdminFields = canUpdateGlobal
      ? true
      : !isSelf && canUpdateOthers;

    if (canManageAdminFields) {
      if (dto.branchId)
        relations.branch = await this.branchService.getBranchEntityById(
          dto.branchId,
        );
      if (dto.userAccountStatusId)
        relations.accountStatus = await this.enumService.getEnumValueById(
          dto.userAccountStatusId,
        );
      if (dto.expectedGraduateYearId)
        relations.expectedGradYear = await this.enumService.getEnumValueById(
          dto.expectedGraduateYearId,
        );
    }
    // ... (Year Validation logic stays the same) ...

    const updatedEntity = UpdatePersonalInfoMapper.toUpdateEntity(
      targetProfile,
      dto,
      canManageAdminFields, // Replacing 'isAdmin'
      relations,
    );
    updatedEntity.updatedBy = currentUser.id;
    const saved = await this.personalInfoRepo.saveInfo(updatedEntity);
    return PersonalInfoResponseMapper.toResponse(saved);
  }
  // ================================
  async updateProfileImage(
    targetProfileId: string,
    dto: UpdateProfileImageDto,
    currentUser: UserResponseDto,
  ) {
    const targetProfile =
      await this.personalInfoRepo.findPersonalInfoById(targetProfileId);
    if (!targetProfile) throw new NotFoundException(ERRORMESSAGE.NOT_FOUND);

    const isSelf = targetProfile.user?.id === currentUser.id;
    const canOverride = currentUser.permissions.includes('*:*');

    if (!isSelf && !canOverride) {
      throw new ForbiddenException(
        'You can only update your own profile image.',
      );
    }

    let fileIdToDelete: string | null = null;

    if (dto.profileImageId === null) {
      if (targetProfile.profileImage)
        fileIdToDelete = targetProfile.profileImage.id;
      targetProfile.profileImage = null;
    } else if (dto.profileImageId) {
      const newImageFile = await this.fileUploadService.findFileEntityById(
        dto.profileImageId,
      );
      if (!newImageFile) throw new NotFoundException('Image not found.');

      if (
        targetProfile.profileImage &&
        targetProfile.profileImage.id !== newImageFile.id
      ) {
        fileIdToDelete = targetProfile.profileImage.id;
      }
      targetProfile.profileImage = newImageFile;
    }

    targetProfile.updatedBy = currentUser.id;
    const saved = await this.personalInfoRepo.saveInfo(targetProfile);
    return PersonalInfoResponseMapper.toResponse(saved);
  }

  // ================================
  async findAll(
    query: FindUsersPersonalInfoQueryDto,
    currentUser: UserResponseDto,
  ) {
    const canAccessAll =
      currentUser.permissions.includes('user:read-all-branches') ||
      currentUser.permissions.includes('*:*');

    const branchConstraint = canAccessAll ? undefined : currentUser.branchId;

    const paginatedResult = await this.personalInfoRepo.FindAll(
      query,
      canAccessAll,
      branchConstraint ?? undefined,
    );

    return {
      items: PersonalInfoResponseMapper.toPaginatedResponse(
        paginatedResult.items,
      ),
      meta: paginatedResult.meta,
    };
  }
  // ================================
  async getDetailedProfile(
    personalInfoId: string,
    currentUser: UserResponseDto,
  ) {
    const profile =
      await this.personalInfoRepo.findPersonalInfoById(personalInfoId);
    if (!profile)
      throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('Profile'));

    const canReadAll =
      currentUser.permissions.includes('user:read-all-branches') ||
      currentUser.permissions.includes('*:*');

    // 3. PBAC Branch Check
    // If not a global reader, ensure the branch matches
    if (!canReadAll && profile.branch?.id !== currentUser.branchId) {
      throw new ForbiddenException(
        'Access denied: Profile belongs to another branch.',
      );
    }

    return PersonalInfoResponseMapper.toResponse(profile);
  }
  // ================================

  async changeUserRole(
    personalInfoId: string,
    dto: ChangeUserRoleDto,
    currentUser: UserResponseDto,
  ) {
    const profile =
      await this.personalInfoRepo.findPersonalInfoById(personalInfoId);
    if (!profile || !profile.user)
      throw new NotFoundException('User profile not found');

    // 1. PBAC Permission Check
    const canManageRoles = currentUser.permissions.includes('user:manage-role');
    const hasGlobalAccess =
      currentUser.permissions.includes('user:manage-global') ||
      currentUser.permissions.includes('*:*');

    if (!canManageRoles) {
      throw new ForbiddenException(
        'Insufficient permissions to change user roles.',
      );
    }

    // 2. Branch Isolation Logic
    // If not global, you can only change roles for people in your branch
    if (!hasGlobalAccess && profile.branch?.id !== currentUser.branchId) {
      throw new ForbiddenException(
        'You can only manage roles within your own branch.',
      );
    }

    // 3. Fetch the new Role Entity (from RoleRepo, not EnumService)
    const newRole = await this.roleService.findEntityByRoleId(dto.newRoleId);

    if (!newRole) throw new BadRequestException('Invalid Role ID');

    // 4. Safety: Prevent non-global users from creating Super Admins
    if (newRole.name === 'SUPER_ADMIN' && !hasGlobalAccess) {
      throw new ForbiddenException(
        'You do not have permission to assign the SUPER_ADMIN role.',
      );
    }

    // 5. Update & Invalidate Cache
    profile.user.role = newRole;
    await this.authRepository.save(profile.user);
    await this.personalInfoRepo.clearSingleUserCache(profile.user.id);

    return { message: `User role updated successfully to ${newRole.name}` };
  }
  // ================================

  async toggleAccountStatus(
    personalInfoId: string,
    dto: ToggleStatusDto,
    currentUser: UserResponseDto,
  ) {
    const profile =
      await this.personalInfoRepo.findPersonalInfoById(personalInfoId);
    if (!profile)
      throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('Profile'));

    // 1. PBAC Permission Checks
    const canManageStatus =
      currentUser.permissions.includes('user:manage-status');
    const hasGlobalAccess =
      currentUser.permissions.includes('user:manage-global') ||
      currentUser.permissions.includes('*:*');

    if (!canManageStatus) {
      throw new ForbiddenException(
        'Insufficient permissions to toggle account status.',
      );
    }

    // 2. Branch Isolation Logic
    // If user has status permission but NOT global access, they are locked to their branch
    if (!hasGlobalAccess && profile.branch?.id !== currentUser.branchId) {
      throw new ForbiddenException(
        'You can only manage status for users within your own branch.',
      );
    }

    // 3. Protection: Prevent non-global users from deactivating Super Admins
    if (profile.user?.role?.name === 'SUPER_ADMIN' && !hasGlobalAccess) {
      throw new ForbiddenException(
        'You do not have permission to modify a Super Admin account.',
      );
    }

    // 4. Fetch the Enum Status
    const status = await this.enumService.getEnumValueById(dto.statusId);

    if (!status) throw new BadRequestException('Invalid Status ID');

    profile.userAccountStatus = status;

    await this.personalInfoRepo.saveInfo(profile);

    return {
      message: 'Account status updated successfully to ${status.value}.',
      data: { feedback: profile.statusFeedback },
    };
  }

  // ================================
  async searchStaffForAssignment(
    searchTerm: string,
    limit: number = 15,
    branchIdConstraint?: string,
  ) {
    const rawItems = await this.personalInfoRepo.searchStaffForCombobox(
      searchTerm,
      limit,
      branchIdConstraint,
    );

    return rawItems.map((profile) => ({
      id: profile.id,
      userId: profile.user?.id || null,
      fullName: `${profile.firstName} ${profile.lastName}`,
      roleName: profile.user?.role?.name || null, // UI uses 'name' now
    }));
  }
  // ================================
  // ==========================================
  // GET PENDING USERS (For the HOD Dashboard)
  // ==========================================
  async getPendingUsers(
    query: FindUsersPersonalInfoQueryDto,
    currentUser: UserResponseDto,
  ) {
    const canAccessAll =
      currentUser.permissions.includes('user:read-all-branches') ||
      currentUser.permissions.includes('*:*');
    const branchConstraint = canAccessAll ? undefined : currentUser.branchId;

    query.statusKey = ENUM_VALUES.USER_ACC_STATUS.PENDING;

    const paginatedResult = await this.personalInfoRepo.FindAll(
      query,
      canAccessAll,
      branchConstraint ?? undefined,
    );

    return {
      items: PersonalInfoResponseMapper.toPaginatedResponse(
        paginatedResult.items,
      ),
      meta: paginatedResult.meta,
    };
  }
  // ================================
  // ==========================================
  // APPROVE PENDING USER
  // ==========================================
  async approveUser(
    personalInfoId: string,
    dto: ApproveUserDto,
    currentUser: UserResponseDto,
  ) {
    const profile =
      await this.personalInfoRepo.findPersonalInfoById(personalInfoId);
    if (!profile || !profile.user)
      throw new NotFoundException('User profile not found');

    // 1. PBAC & Branch Checks (Needs permission to manage status AND roles)
    const canManageStatusAndRoles =
      currentUser.permissions.includes('user:manage-status') &&
      currentUser.permissions.includes('user:manage-role');
    const hasGlobalAccess =
      currentUser.permissions.includes('*:*') ||
      currentUser.permissions.includes('user:manage-global');

    if (!canManageStatusAndRoles && !hasGlobalAccess) {
      throw new ForbiddenException(
        'Insufficient permissions to approve users.',
      );
    }

    if (!hasGlobalAccess && profile.branch?.id !== currentUser.branchId) {
      throw new ForbiddenException(
        'You can only approve users within your own branch.',
      );
    }

    // 2. Validate current status is actually Pending
    if (
      profile.userAccountStatus?.key !== ENUM_VALUES.USER_ACC_STATUS.PENDING
    ) {
      throw new BadRequestException('This user is not in a pending state.');
    }

    // 3. Fetch the new Role & Active Status
    const newRole = await this.roleService.findEntityByRoleId(dto.roleId);
    if (!newRole)
      throw new BadRequestException('Invalid Role ID provided for approval.');

    if (newRole.name === 'SUPER_ADMIN' && !hasGlobalAccess) {
      throw new ForbiddenException(
        'You cannot approve someone as a SUPER_ADMIN.',
      );
    }

    const activeStatus = await this.enumService.getMeEnumValueIfExist(
      ENUM_TYPES.USER_ACC_STATUS,
      ENUM_VALUES.USER_ACC_STATUS.ACTIVE,
    );
    if (!activeStatus)
      throw new InternalServerErrorException(
        'Active status enum missing from database.',
      );

    // 4. Apply the Upgrades
    profile.user.role = newRole;
    profile.userAccountStatus = activeStatus;
    profile.statusFeedback = null; // Clear any old rejection notes

    // 5. Save & Clear Caches
    await this.authRepository.save(profile.user);
    const savedProfile = await this.personalInfoRepo.saveInfo(profile);

    await this.personalInfoRepo.clearSingleUserCache(profile.user.id);

    // (Optional) Here you can trigger this.mailService.sendApprovalEmail(profile.user.email)

    return {
      message: `User successfully approved and upgraded to ${newRole.name}.`,
    };
  }
  // ================================
}
