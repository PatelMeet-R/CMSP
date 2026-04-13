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

      address: {
        city: entity.city,
        state: entity.state,
        country: entity.country,
        postalCode: entity.postalCode,
      },
      primaryMobileNumber: entity.primaryMobileNumber,
      secondaryMobileNumber: entity.secondaryMobileNumber,

      email: entity.user?.email || null,
      role: entity.user?.role?.key || null,

      branch: entity.branch?.name || null,
      gender: entity.gender?.key || null,
      accountStatus: entity.userAccountStatus?.key || null,
      joinedYear: entity.joinedAcademicYear?.key || null,
      gradYear: entity.expectedGraduateYear?.key || null,
      createdAt: entity.createdAt,
    };
  }

  static toPaginatedResponse(items: PersonalInfo[]) {
    return items.map((entity) => ({
      id: entity.id,
      enrollmentNumber: entity.enrollmentNumber,
      fullName: `${entity.firstName} ${entity.lastName}`,
      firstName: entity.firstName,
      lastName: entity.lastName,

      address: {
        city: entity.city,
      },

      branch: entity.branch?.name || null,
      gender: entity.gender?.key || null,
      accountStatus: entity.userAccountStatus?.key || null,
    }));
  }
}
