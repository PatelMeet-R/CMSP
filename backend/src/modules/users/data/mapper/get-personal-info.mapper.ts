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
      primaryMobileNumber: profile.primaryMobileNumber,

      branch: profile.branch?.name || null,
      gender: profile.gender?.key || null,
      joinedYear: profile.joinedAcademicYear?.key || null,
      expectedGraduationYear: profile.expectedGraduateYear?.key || null,
      accountStatus: profile.userAccountStatus?.key || null,

      branchId: profile.branch?.id || null,
      genderId: profile.gender?.id || null,
      joinedYearId: profile.joinedAcademicYear?.id || null,
      expectedGraduationYearId: profile.expectedGraduateYear?.id || null,
      accountStatusId: profile.userAccountStatus?.id || null,

      address: {
        city: profile.city,
        state: profile.state,
        country: profile.country,
      },
    };
  }
}
