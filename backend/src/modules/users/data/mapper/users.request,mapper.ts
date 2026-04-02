import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { PersonalInfo } from '../../domain/entities/personal-info.entity';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { UpdatePersonalInfoDto } from '../../presentation/dto/request/update-personal-info.dto';

export class UpdatePersonalInfoMapper {
  static toUpdateEntity(
    entity: PersonalInfo,
    dto: UpdatePersonalInfoDto,
    isAdmin: boolean,
    relations: {
      gender?: EnumValue;
      joinedYear?: EnumValue;
      expectedGradYear?: EnumValue;
      accountStatus?: EnumValue;
      branch?: Branch;
    },
  ) {
    // 1. BASIC FIELDS (Always mapped if provided)
    if (dto.primaryMobileNumber !== undefined)
      entity.primaryMobileNumber = dto.primaryMobileNumber;
    if (dto.secondaryMobileNumber !== undefined)
      entity.secondaryMobileNumber = dto.secondaryMobileNumber;
    if (dto.city !== undefined) entity.city = dto.city;
    if (dto.state !== undefined) entity.state = dto.state;
    if (dto.country !== undefined) entity.country = dto.country;
    if (dto.postalCode !== undefined) entity.postalCode = dto.postalCode;

    if (relations.gender !== undefined) entity.gender = relations.gender;
    if (relations.joinedYear !== undefined)
      entity.joinedAcademicYear = relations.joinedYear;

    // 2. SENSITIVE FIELDS (Only mapped if user is Admin)
    if (isAdmin) {
      if (dto.firstName !== undefined) entity.firstName = dto.firstName;
      if (dto.lastName !== undefined) entity.lastName = dto.lastName;
      if (dto.enrollmentNumber !== undefined)
        entity.enrollmentNumber = dto.enrollmentNumber;

      if (relations.branch !== undefined) entity.branch = relations.branch;
      if (relations.expectedGradYear !== undefined)
        entity.expectedGraduateYear = relations.expectedGradYear;
      if (relations.accountStatus !== undefined)
        entity.userAccountStatus = relations.accountStatus;
    }

    return entity;
  }
}
