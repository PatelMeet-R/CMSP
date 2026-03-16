import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { PersonalInfo } from '../../domain/entities/personal-info.entity';
import { CreatePersonalInfoDto } from '../../presentation/dto/request/pi-create.request.dto';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { User } from 'src/modules/auth/domain/entities/user.entity';

export class CreatePersonalInfoMapper {
  static toCreateEntity(
    dto: CreatePersonalInfoDto,
    user: User,
    gender: EnumValue,
    branch: Branch,
    joinedAcademicYear: EnumValue,
    expectedGraduateYear: EnumValue,
    createdBy: number,
  ): PersonalInfo {
    const entity = new PersonalInfo();
    entity.user = user;

    entity.firstName = dto.firstName;
    entity.lastName = dto.lastName;
    entity.branch = branch;

    entity.primaryMobileNumber = dto.primaryMobileNumber;
    entity.secondaryMobileNumber = dto.secondaryMobileNumber;

    entity.city = dto.city;
    entity.state = dto.state;
    entity.country = dto.country;
    entity.postalCode = dto.postalCode;

    entity.gender = gender;
    entity.joinedAcademicYear = joinedAcademicYear;
    entity.expectedGraduateYear = expectedGraduateYear;

    entity.createdBy = createdBy;

    return entity;
  }
}
