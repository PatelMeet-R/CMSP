import { PersonalInfo } from '../../domain/entities/personal-info.entity';

export class PersonalProfileResponseMapper {
  static toResponse(profile: PersonalInfo) {
    if (!profile) return null;

    return {
      id: profile.id,
      fullName: profile.fullName,
      firstName: profile.firstName,
      lastName: profile.lastName,
      enrollmentNumber: profile.enrollmentNumber,

      gender: profile.gender?.key || null,
      branch: profile.branch?.name || null,
      joinedYear: profile.joinedAcademicYear?.key || null,
      expectedGraduationYear: profile.expectedGraduateYear?.key || null,
      accountStatus: profile.userAccountStatus?.key || null,

      address: {
        city: profile.city,
        state: profile.state,
        country: profile.country,
      },
    };
  }
}
