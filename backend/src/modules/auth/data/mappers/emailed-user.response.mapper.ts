import { User } from '../../domain/entities/user.entity';

export class EmailedUserResponse {
  static toResponseDto(data: User, noHashPassword: string, creator: User) {
    return {
      email: data.email,
      role: data.role?.key,
      password: noHashPassword,
      branch: data.personalInfo.branch.name,
      createdBy: creator.personalInfo.fullName,
      fullName: data.personalInfo.fullName,

      designation: data.staffProfile?.designation,
      officeLocation: data.staffProfile?.officeLocation,
      joiningDate: data.staffProfile?.joiningDate,
    };
  }
}
