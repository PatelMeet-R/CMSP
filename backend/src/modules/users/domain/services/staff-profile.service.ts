import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hasPermission } from 'src/common/utils/permissions/permission.utils';
import { UpsertStaffProfileDto } from '../../presentation/dto/request/staff-profile.dto';
import { AuthService } from 'src/modules/auth/domain/services/auth.service';
import { StaffProfileRepository } from 'src/modules/users/data/repository/staff-profile.repository';
import { StaffProfileResponseMapper } from 'src/modules/users/data/mapper/staff-profile.response.mapper';
import { StaffProfileRequestMapper } from 'src/modules/users/data/mapper/staff-profile.request.mapper';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

@Injectable()
export class StaffProfileService {
  constructor(
    private readonly staffProfileRepo: StaffProfileRepository,
    private readonly authService: AuthService,
  ) {}

  //=========================

  // Get Profile
  // async getProfileByUserId(targetUserId: string, currentUser: UserResponseDto) {
  //   const profile = await this.staffProfileRepo.findByUserId(targetUserId);
  //   if (!profile) {
  //     throw new NotFoundException(
  //       'Professional profile not found for this user.',
  //     );
  //   }
  //   // 1. PBAC Security Gate
  //   const isSelf = targetUserId === currentUser.id;
  //   const canReadAll = hasPermission(
  //     currentUser.permissions,
  //     'user:read-all-branches',
  //   );

  //   if (!isSelf && !canReadAll) {
  //     const targetBranchId = profile.user?.personalInfo?.branch?.id;
  //     if (targetBranchId !== currentUser.branchId) {
  //       throw new ForbiddenException(
  //         'Access denied: Staff profile belongs to another branch.',
  //       );
  //     }
  //   }

  //   return StaffProfileResponseMapper.toResponse(profile);
  // }

  // ========================
  async getProfileByUserId(targetId: string, currentUser: UserResponseDto) {
    // Now uses the smart lookup
    const profile =
      await this.staffProfileRepo.findByUserIdOrPersonalInfoId(targetId);

    //  Graceful fallback for new profiles
    if (!profile) {
      return null;
    }

    // 1. PBAC Security Gate
    const isSelf = profile.user.id === currentUser.id;
    const canReadAll = hasPermission(
      currentUser.permissions,
      'user:read-all-branches',
    );

    if (!isSelf && !canReadAll) {
      const targetBranchId = profile.user?.personalInfo?.branch?.id;
      if (targetBranchId !== currentUser.branchId) {
        throw new ForbiddenException(
          'Access denied: Staff profile belongs to another branch.',
        );
      }
    }

    return StaffProfileResponseMapper.toResponse(profile);
  }

  //=========================

  // Update Profile (Upsert)
  async upsertStaffProfile(
    targetUserId: string,
    dto: UpsertStaffProfileDto,
    currentUser: UserResponseDto,
  ) {
    const user = await this.authService.findUserEntityById(targetUserId);
    if (!user) throw new NotFoundException('User not found');

    const profile = await this.staffProfileRepo.findByUserId(targetUserId);
    if (!profile) throw new NotFoundException('Staff Profile Not Exist');

    // 1. PBAC Security Gate
    const canUpdateGlobal = hasPermission(
      currentUser.permissions,
      'user:manage-global',
    );

    if (!canUpdateGlobal) {
      const targetBranchId = profile.user?.personalInfo?.branch?.id;
      if (targetBranchId !== currentUser.branchId) {
        throw new ForbiddenException(
          'You can only update staff profiles within your own branch.',
        );
      }
    }

    const updatedProfileEntity = StaffProfileRequestMapper.toUpdateEntity(
      profile,
      dto,
    );

    updatedProfileEntity.updatedBy = currentUser.id;

    const savedProfile =
      await this.staffProfileRepo.saveProfile(updatedProfileEntity);
    return StaffProfileResponseMapper.toResponse(savedProfile);
  }
}
