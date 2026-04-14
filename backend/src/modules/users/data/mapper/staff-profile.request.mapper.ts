import { StaffProfile } from '../../domain/entities/staff-profile.entity';
import { UpsertStaffProfileDto } from '../../presentation/dto/request/staff-profile.dto';

export class StaffProfileRequestMapper {
  static toUpdateEntity(
    profile: StaffProfile,
    dto: UpsertStaffProfileDto,
  ): StaffProfile {
    if (dto.designation) profile.designation = dto.designation;
    if (dto.officeLocation) profile.officeLocation = dto.officeLocation;
    if (dto.joiningDate) profile.joiningDate = new Date(dto.joiningDate);
    if (dto.maxSubjectWorkload !== undefined) {
      profile.maxSubjectWorkload = dto.maxSubjectWorkload;
    }

    return profile;
  }
}
