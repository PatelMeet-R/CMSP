import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { RegisterSpecificUserDto } from '../../presentation/dto/request/register-specific-user.request.dto';
import { User } from '../../domain/entities/user.entity';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { PersonalInfo } from 'src/modules/users/domain/entities/personal-info.entity';
import { StaffProfile } from 'src/modules/users/domain/entities/staff-profile.entity';

export class RegisterSpecificUserMapper {
  static toRegisterEntity(
    dto: RegisterSpecificUserDto,
    hashPassword: string,
    role: EnumValue,
    userAccountStatus: EnumValue,
    createdBy: number,
    branch: Branch,
  ): User {
    const user = new User();
    user.email = dto.email;
    user.password = hashPassword;
    user.role = role;
    user.createdBy = createdBy;
    const pi = new PersonalInfo();
    pi.branch = branch;
    pi.firstName = dto.firstName;
    pi.lastName = dto.lastName;
    pi.userAccountStatus = userAccountStatus;
    pi.enrollmentNumber = `STF_${Date.now().toString(36)}`;
    pi.primaryMobileNumber = '0000000000';
    pi.secondaryMobileNumber = undefined;
    pi.city = 'Unknown';
    pi.state = 'Unknown';
    pi.country = 'Unknown';
    pi.postalCode = '000000';

    // =============
    const staffProfile = new StaffProfile();
    staffProfile.designation = dto.designation;
    staffProfile.officeLocation = dto.officeLocation;
    staffProfile.joiningDate = dto.joiningDate
      ? new Date(dto.joiningDate)
      : new Date();
    staffProfile.maxSubjectWorkload = 4;

    user.staffProfile = staffProfile;
    user.personalInfo = pi;

    return user;
  }
}
