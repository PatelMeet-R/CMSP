import { PersonalInfo } from '../../domain/entities/personal-info.entity';

export class PersonalInfoResponseMapper {
  static toResponse(entity: PersonalInfo) {
    return {
      id: entity.id,
      profileImageUrl: entity.profileImage?.url || null,
      enrollmentNumber: entity.enrollmentNumber,
      fullName: `${entity.firstName} ${entity.lastName}`,
      firstName: entity.firstName,
      lastName: entity.lastName,
      contact: {
        primary: entity.primaryMobileNumber,
        city: entity.city,
        state: entity.state,
      },

      branch: entity.branch?.name || null,
      gender: entity.gender?.key || null,
      accountStatus: entity.userAccountStatus?.key || null,
      joinedYear: entity.joinedAcademicYear?.key || null,
      gradYear: entity.expectedGraduateYear?.key || null,
      createdAt: entity.createdAt,
    };
  }

  static toPaginatedResponse(items: PersonalInfo[]) {
    return items.map((item) => this.toResponse(item));
  }
}
