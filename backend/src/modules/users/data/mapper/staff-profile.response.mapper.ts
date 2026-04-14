import { StaffProfile } from '../../domain/entities/staff-profile.entity';

export class StaffProfileResponseMapper {
  static toResponse(entity: StaffProfile) {
    return {
      id: entity.id,
      designation: entity.designation,
      officeLocation: entity.officeLocation,
      joiningDate: entity.joiningDate
        ? new Date(entity.joiningDate).toISOString().split('T')[0]
        : null,
      maxSubjectWorkload: entity.maxSubjectWorkload,
    };
  }
}
