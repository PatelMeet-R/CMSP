import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { PersonalInfo } from '../../domain/entities/personal-info.entity';
import { UpdateByUserPersonalInfoDto } from '../../presentation/dto/request/user-pi-update.request.dto';
import { AdminUpdatePersonalInfoDto } from '../../presentation/dto/request/admin-pi-update.request.dto';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';

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
    if (dto.firstName) entity.firstName = dto.firstName;
    if (dto.lastName) entity.lastName = dto.lastName;
    if (branch) entity.branch = branch;
    if (expectedGraduateYear)
      entity.expectedGraduateYear = expectedGraduateYear;
    if (userAccountStatus) entity.userAccountStatus = userAccountStatus;
    return entity;
  }
}
