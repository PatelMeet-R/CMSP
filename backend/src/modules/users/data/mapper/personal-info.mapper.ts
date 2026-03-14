import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { PersonalInfo } from '../../domain/entities/personal-info.entity';
import { CreatePersonalInfoDto } from '../../presentation/dto/request/pi-create.request.dto';
import { PersonalInfoResponseDto } from '../../presentation/dto/response/pi.response.dto';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { User } from 'src/modules/auth/domain/entities/user.entity';

export class PersonalInfoMapper {
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

  static toResponse(entity: PersonalInfo): PersonalInfoResponseDto {
    const dto = new PersonalInfoResponseDto();

    dto.id = entity.id;

    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;

    dto.fullName = entity.fullName;

    dto.gender = entity.gender?.value;

    dto.branch = entity.branch?.name;

    dto.joinedAcademicYear = entity.joinedAcademicYear?.value;

    dto.expectedGraduateYear = entity.expectedGraduateYear?.value;

    dto.primaryMobileNumber = entity.primaryMobileNumber;

    dto.secondaryMobileNumber = entity.secondaryMobileNumber;

    dto.city = entity.city;
    dto.state = entity.state;
    dto.country = entity.country;
    dto.postalCode = entity.postalCode;

    dto.createdAt = entity.createdAt;

    return dto;
  }
}
