import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { RegisterStudentDto } from '../../presentation/dto/request/register.dto';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { User } from '../../domain/entities/user.entity';
import { PersonalInfo } from 'src/modules/users/domain/entities/personal-info.entity';

export class UserRegisterMapper {
  static toRegisterStudentEntity(
    dto: RegisterStudentDto,
    hashedPassword: string,
    role: EnumValue,
    userAccountStatus: EnumValue,
    branch: Branch,
  ): User {
    const user = new User();
    user.email = dto.email;
    user.password = hashedPassword;
    user.role = role;

    const pi = new PersonalInfo();
    pi.branch = branch;
    pi.firstName = dto.firstName;
    pi.lastName = dto.lastName;
    pi.enrollmentNumber = dto.enrollmentNumber;
    pi.userAccountStatus = userAccountStatus;
    // THE BYPASS: Hardcode empty strings for everything the DB demands
    pi.primaryMobileNumber = '0000000000';
    pi.secondaryMobileNumber = undefined;
    pi.city = 'Unknown';
    pi.state = 'Unknown';
    pi.country = 'Unknown';
    pi.postalCode = '000000';
    user.personalInfo = pi;
    return user;
  }
}
