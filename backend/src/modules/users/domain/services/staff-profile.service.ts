import { Injectable, NotFoundException } from '@nestjs/common';
import { UpsertStaffProfileDto } from '../../presentation/dto/request/staff-profile.dto';
import { AuthService } from 'src/modules/auth/domain/services/auth.service';
import { StaffProfileRepository } from 'src/modules/users/data/repository/staff-profile.repository';
import { StaffProfileResponseMapper } from 'src/modules/users/data/mapper/staff-profile.response.mapper';
import { StaffProfileRequestMapper } from 'src/modules/users/data/mapper/staff-profile.request.mapper';

@Injectable()
export class StaffProfileService {
  constructor(
    private readonly staffProfileRepo: StaffProfileRepository,
    private readonly authService: AuthService,
  ) {}

  //=========================

  // Get Profile
  async getProfileByUserId(userId: number) {
    const profile = await this.staffProfileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException(
        'Professional profile not found for this user.',
      );
    }

    return StaffProfileResponseMapper.toResponse(profile);
  }
  //=========================

  // Update Profile (Upsert)
  async upsertStaffProfile(userId: number, dto: UpsertStaffProfileDto) {
    const user = await this.authService.findUserEntityById(userId);
    if (!user) throw new NotFoundException('User not found');

    let profile = await this.staffProfileRepo.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Staff Profile Not Exist');
    }

    const updatedProfileEntity = StaffProfileRequestMapper.toUpdateEntity(
      profile,
      dto,
    );

    // Save the entity
    const savedProfile =
      await this.staffProfileRepo.saveProfile(updatedProfileEntity);

    // Return the mapped response
    return StaffProfileResponseMapper.toResponse(savedProfile);
  }
}
