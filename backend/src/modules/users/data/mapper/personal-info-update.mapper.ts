import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { PersonalInfo } from '../../domain/entities/personal-info.entity';
import { UpdateByUserPersonalInfoDto } from '../../presentation/dto/request/user-pi-update.request.dto';
import { AdminUpdatePersonalInfoDto } from '../../presentation/dto/request/admin-pi-update.request.dto';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { unwatchFile } from 'fs';

export class UpdatePersonalInfoMapper {
  static toPersonalInfoUpdateEntity(
    entity: PersonalInfo,
    dto: UpdateByUserPersonalInfoDto,
    gender?: EnumValue,
  ) {
    if (gender) entity.gender = gender;

    if (dto.primaryMobileNumber) {
      entity.primaryMobileNumber = dto.primaryMobileNumber;
    }

    if (dto.secondaryMobileNumber) {
      entity.secondaryMobileNumber = dto.secondaryMobileNumber;
    }

    if (dto.city) entity.city = dto.city;
    if (dto.state) entity.state = dto.state;
    if (dto.country) entity.country = dto.country;
    if (dto.postalCode) entity.postalCode = dto.postalCode;

    return entity;
  }
  static toAdminUpdateEntity(
    entity: PersonalInfo,
    dto: AdminUpdatePersonalInfoDto,
    userAccountStatus?: EnumValue,
    expectedGraduateYear?: EnumValue,
    branch?: Branch,
  ) {
    if (dto.enrollmentNumber !== undefined)
      entity.enrollmentNumber = dto.enrollmentNumber;
    if (dto.firstName !== undefined) entity.firstName = dto.firstName;
    if (dto.lastName !== undefined) entity.lastName = dto.lastName;
    if (branch !== undefined) entity.branch = branch;
    if (expectedGraduateYear !== undefined)
      entity.expectedGraduateYear = expectedGraduateYear;
    if (userAccountStatus !== undefined)
      entity.userAccountStatus = userAccountStatus;
    return entity;
  }
}
