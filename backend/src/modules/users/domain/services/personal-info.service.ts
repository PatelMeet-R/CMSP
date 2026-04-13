import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PersonalInfoRepository } from '../../data/repository/personal-info-repository';

import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import { BranchService } from 'src/modules/branch/domain/branch.service';

import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { ROLES } from 'src/common/constants/roles.constant';
import { UpdatePersonalInfoMapper } from 'src/modules/users/data/mapper/users.request,mapper';
import { UpdatePersonalInfoDto } from 'src/modules/users/presentation/dto/request/update-personal-info.dto';
import { PersonalInfoResponseMapper } from 'src/modules/users/data/mapper/users-response.mapper';
import { FindUsersPersonalInfoQueryDto } from 'src/common/pagination/dto/find-users-personal-query.dto';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { ENUM_TYPES } from 'src/common/constants/enum-types.constant';
import { AuthRepository } from 'src/modules/auth/data/repository';
import {
  ChangeUserRoleDto,
  ToggleStatusDto,
} from 'src/modules/users/presentation/dto/request/update-User.dto';
import { FileUploadService } from 'src/modules/file-upload/domain/file-upload.service';
import { Inject, forwardRef } from '@nestjs/common';
import type { UpdateProfileImageDto } from 'src/modules/users/presentation/dto/request/update-profile-image.dto';

@Injectable()
export class PersonalInfoService {
  constructor(
    private readonly personalInfoRepo: PersonalInfoRepository,
    private readonly enumService: EnumService,
    private readonly branchService: BranchService,
    @Inject(forwardRef(() => AuthRepository))
    private readonly authRepository: AuthRepository,
    private readonly fileUploadService: FileUploadService,
  ) {}
  // ================================

  async getPersonalProfileByAuthId(userId: number) {
    const profile =
      await this.personalInfoRepo.getPersonalProfileByAuthId(userId);
    const mappedResponse = PersonalInfoResponseMapper.toResponse(profile);
    return mappedResponse;
  }
  // ================================

  async updateSmartProfile(
    targetProfileId: number,
    dto: UpdatePersonalInfoDto,
    currentUser: UserResponseDto,
  ) {
    // 1. Fetch profile
    const targetProfile =
      await this.personalInfoRepo.findPersonalInfoById(targetProfileId);
    if (!targetProfile) throw new NotFoundException(ERRORMESSAGE.NOT_FOUND);

    // 2. Determine permissions
    const isSelf = targetProfile.user?.id === currentUser.id;
    const isAdmin =
      currentUser.role === ROLES.SUPER_ADMIN || currentUser.role === ROLES.HOD;

    // 3. SECURITY GATE: Stop students from editing other students
    if (!isSelf && !isAdmin) {
      throw new ForbiddenException(
        "You do not have permission to edit someone else's profile.",
      );
    }

    // 4. HOD GATE: Make sure HODs can only edit students in their own branch
    if (
      currentUser.role === ROLES.HOD &&
      !isSelf &&
      targetProfile.branch?.id !== currentUser.branchId
    ) {
      throw new ForbiddenException(
        'HODs can only edit profiles within their own branch.',
      );
    }
    if (
      isAdmin &&
      dto.enrollmentNumber &&
      dto.enrollmentNumber !== targetProfile.enrollmentNumber
    ) {
      const exists = await this.personalInfoRepo.isUserExistWithEnrollment(
        dto.enrollmentNumber,
      );
      if (exists) throw new ConflictException(ERRORMESSAGE.ENROLLMENT_TAKEN);
    }
    const relations: any = {};
    if (dto.genderId)
      relations.gender = await this.enumService.getEnumValueById(dto.genderId);
    if (dto.joinedAcademicYearId)
      relations.joinedYear = await this.enumService.getEnumValueById(
        dto.joinedAcademicYearId,
      );
    if (isAdmin) {
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
    // 1.THE YEAR VALIDATION CHECK
    const joinedYearStr = relations.joinedYear
      ? relations.joinedYear.value
      : targetProfile.joinedAcademicYear?.value;
    const expectedYearStr = relations.expectedGradYear
      ? relations.expectedGradYear.value
      : targetProfile.expectedGraduateYear?.value;

    if (joinedYearStr && expectedYearStr) {
      const joinedYear = Number(joinedYearStr);
      const expectedYear = Number(expectedYearStr);

      if (expectedYear < joinedYear || expectedYear > joinedYear + 6) {
        throw new ConflictException(ERRORMESSAGE.INVALID_YEAR_ENTRY);
      }
    }

    const updatedEntity = UpdatePersonalInfoMapper.toUpdateEntity(
      targetProfile,
      dto,
      isAdmin,
      relations,
    );
    updatedEntity.updatedBy = currentUser.id;

    const saved = await this.personalInfoRepo.saveInfo(updatedEntity);
    return PersonalInfoResponseMapper.toResponse(saved);
  }
  // ================================
  async updateProfileImage(
    targetProfileId: number,
    dto: UpdateProfileImageDto,
    currentUser: UserResponseDto,
  ) {
    //  Fetch profile
    const targetProfile =
      await this.personalInfoRepo.findPersonalInfoById(targetProfileId);
    if (!targetProfile) throw new NotFoundException(ERRORMESSAGE.NOT_FOUND);

    //  Only the owner can change their image
    const isSelf = targetProfile.user?.id === currentUser.id;

    if (!isSelf) {
      throw new ForbiddenException(
        'You can only update your own profile image.',
      );
    }
    let fileIdToDelete: number | null = null;

    //  THE SWAP & CLEANUP LOGIC
    if ('profileImageId' in dto) {
      // SCENARIO A: Remove Image
      if (dto.profileImageId === null) {
        if (targetProfile.profileImage) {
          fileIdToDelete = targetProfile.profileImage.id;
        }
        targetProfile.profileImage = null;
      } else if (typeof dto.profileImageId === 'number') {
        // Find the new file
        const newImageFile = await this.fileUploadService.findFileEntityById(
          dto.profileImageId,
        );
        if (!newImageFile)
          throw new NotFoundException('Uploaded profile image not found.');

        // Mark old file for deletion
        if (
          targetProfile.profileImage &&
          targetProfile.profileImage.id !== newImageFile.id
        ) {
          fileIdToDelete = targetProfile.profileImage.id;
        }

        targetProfile.profileImage = newImageFile;
      }
    } else {
      throw new NotFoundException(
        `profileImageId was missing from the DTO entirely!`,
      );
    }

    targetProfile.updatedBy = currentUser.id;

    //  Save
    const saved = await this.personalInfoRepo.saveInfo(targetProfile);
    await this.personalInfoRepo.clearSingleUserCache(currentUser.id);

    if (fileIdToDelete) {
      await this.fileUploadService
        .remove(fileIdToDelete)
        .catch((e) => console.error('Cleanup failed:', e.message));
    }

    return PersonalInfoResponseMapper.toResponse(saved);
  }
  // ================================
  async findAll(
    query: FindUsersPersonalInfoQueryDto,
    currentUserRole,
    currentUserBranchId,
  ) {
    const paginatedResult = await this.personalInfoRepo.FindAll(
      query,
      currentUserRole,
      currentUserBranchId,
    );

    return {
      items: PersonalInfoResponseMapper.toPaginatedResponse(
        paginatedResult.items,
      ),
      meta: paginatedResult.meta,
    };
  }
  // ================================

  async getDetailedProfile(personalInfoId: number, currentUser: User) {
    const profile =
      await this.personalInfoRepo.findPersonalInfoById(personalInfoId);

    if (!profile) {
      throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('Profile'));
    }

    const userRoleString = currentUser.role?.key;
    const userBranchId = currentUser.personalInfo?.branch?.id;

    if (userRoleString === ROLES.HOD && profile.branch?.id !== userBranchId) {
      throw new ForbiddenException(
        'HODs can only view profiles within their own branch.',
      );
    }

    return PersonalInfoResponseMapper.toResponse(profile);
  }
  // ================================

  async changeUserRole(
    personalInfoId: number,
    dto: ChangeUserRoleDto,
    currentUser: UserResponseDto,
  ) {
    const profile =
      await this.personalInfoRepo.findPersonalInfoById(personalInfoId);
    if (!profile || !profile.user) throw new NotFoundException();

    const userRoleKey = currentUser.role;
    const userBranchId = currentUser.branchId;

    const targetUser = profile.user;
    const targetRoleKey = targetUser.role?.key;

    //  Fetch the  Role Enum by ID
    const newRole = await this.enumService.getEnumValueById(dto.newRoleId);
    if (!newRole) throw new BadRequestException('Invalid Role ID');

    //  HOD  CHECK
    if (userRoleKey === ROLES.HOD) {
      // HOD can only promote a Professor in their own branch to HOD
      if (
        targetRoleKey !== ROLES.PROFESSOR ||
        profile.branch?.id !== userBranchId
      ) {
        throw new ForbiddenException(
          'HODs can only promote Professors within their own branch.',
        );
      }
      // Ensure they aren't trying to make someone a SuperAdmin
      if (newRole.key === ROLES.SUPER_ADMIN) {
        throw new ForbiddenException('HODs cannot create Super Admins.');
      }
    }

    //  Update and Clear Cache
    targetUser.role = newRole;
    await this.authRepository.save(targetUser);
    await this.personalInfoRepo.clearSingleUserCache(targetUser.id);

    return { message: 'User role updated successfully' };
  }
  // ================================

  async toggleAccountStatus(
    personalInfoId: number,
    dto: ToggleStatusDto,
    currentUser: UserResponseDto,
  ) {
    const profile =
      await this.personalInfoRepo.findPersonalInfoById(personalInfoId);
    if (!profile) throw new NotFoundException();

    const userRoleKey = currentUser.role;
    const userBranchId = currentUser.branchId;
    const targetRoleKey = profile.user?.role?.key;

    //  PROFESSOR CHECK (Blocked)
    if (userRoleKey === ROLES.PROFESSOR) {
      throw new ForbiddenException(
        'Professors do not have permission to toggle account status.',
      );
    }

    //  HOD CHECK
    if (userRoleKey === ROLES.HOD) {
      // Can only toggle Professor/Student in their branch
      if (
        profile.branch?.id !== userBranchId ||
        targetRoleKey === ROLES.SUPER_ADMIN
      ) {
        throw new ForbiddenException(
          'HODs can only manage status for staff/students in their branch.',
        );
      }
    }

    //  SUPER ADMIN CHECK
    if (userRoleKey === ROLES.SUPER_ADMIN) {
      // Cannot toggle other Super Admins
      if (
        targetRoleKey === ROLES.SUPER_ADMIN &&
        profile.user?.id !== currentUser.id
      ) {
        throw new ForbiddenException(
          'Super Admins cannot deactivate other Super Admins.',
        );
      }
    }

    const status = await this.enumService.getMeEnumValueIfExist(
      ENUM_TYPES.USER_ACC_STATUS,
      dto.statusKey,
    );
    if (!status) throw new BadRequestException('Invalid Status Key');

    profile.userAccountStatus = status;
    await this.personalInfoRepo.saveInfo(profile);

    return { message: 'Account status updated.' };
  }

  // ================================
}
