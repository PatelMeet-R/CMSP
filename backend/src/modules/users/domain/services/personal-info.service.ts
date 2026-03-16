import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PersonalInfoRepository } from '../../data/repository/personal-info-repository';
import { CreatePersonalInfoDto } from '../../presentation/dto/request/pi-create.request.dto';
import { CreatePersonalInfoMapper } from '../../data/mapper/personal-info-create.mapper';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import {
  ENUM_TYPES,
  ENUM_VALUES,
} from 'src/common/constants/enum-types.constant';
import { BranchService } from 'src/modules/branch/domain/branch.service';
import { AuthService } from 'src/modules/auth/domain/services/auth.service';
import { UpdateByUserPersonalInfoDto } from '../../presentation/dto/request/user-pi-update.request.dto';
import { UpdatePersonalInfoMapper } from '../../data/mapper/personal-info-update.mapper';
import { AdminUpdatePersonalInfoDto } from '../../presentation/dto/request/admin-pi-update.request.dto';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { PersonalInfoMapperResponse } from '../../data/mapper/personal-info-response.mapper';

@Injectable()
export class PersonalInfoService {
  constructor(
    private readonly personalInfoRepo: PersonalInfoRepository,
    private readonly enumService: EnumService,
    private readonly userService: AuthService,
    private readonly branchService: BranchService,
  ) {}

  async registerPersonalInfo(dto: CreatePersonalInfoDto, userId: number) {
    const [
      gender,
      joinedAcademicYear,
      expectedGraduateYear,
      accountStatusActive,
      user,
      branch,
    ] = await Promise.all([
      this.enumService.getEnumValueById(dto.genderId),
      this.enumService.getEnumValueById(dto.joinedAcademicYearId),
      this.enumService.getEnumValueById(dto.expectedGraduateYearId),
      this.enumService.getMeEnumValueIfExist(
        ENUM_TYPES.USER_ACC_STATUS,
        ENUM_VALUES.USER_ACC_STATUS.ACTIVE,
      ),
      this.userService.getUserById(userId),
      this.branchService.getBranchEntityById(dto.branchId),
    ]);
    if (
      !gender ||
      !joinedAcademicYear ||
      !expectedGraduateYear ||
      !user ||
      !accountStatusActive ||
      !branch
    ) {
      throw new ConflictException(ERRORMESSAGE.INVALID_REQUEST);
    }
    //validation
    const joinedYear = Number(joinedAcademicYear.value);
    const expectedYear = Number(expectedGraduateYear.value);

    if (expectedYear < joinedYear) {
      throw new ConflictException(ERRORMESSAGE.INVALID_YEAR_ENTRY);
    }

    if (expectedYear > joinedYear + 6) {
      throw new ConflictException(ERRORMESSAGE.INVALID_YEAR_ENTRY);
    }
    const entity = CreatePersonalInfoMapper.toCreateEntity(
      dto,
      user, // User
      gender, // EnumValue
      branch, // Branch
      joinedAcademicYear, // EnumValue
      expectedGraduateYear, // EnumValue
      user.id, // number
    );
    const saved = await this.personalInfoRepo.saveInfo(entity);

    return PersonalInfoMapperResponse.toResponse(saved);
  }
  async updatedByUserPersonalInfo(
    personalInfoId: number,
    dto: UpdateByUserPersonalInfoDto,
    userId: number,
  ) {
    const info =
      await this.personalInfoRepo.findPersonalInfoById(personalInfoId);
    if (!info) {
      throw new NotFoundException(ERRORMESSAGE.NOT_FOUND);
    }
    let gender;

    if (dto.genderId) {
      gender = await this.enumService.getEnumValueById(dto.genderId);

      if (!gender) {
        throw new ConflictException(ERRORMESSAGE.INVALID_REQUEST);
      }
    }

    const entity = UpdatePersonalInfoMapper.toPersonalInfoUpdateEntity(
      info,
      dto,
      gender,
    );
    entity.updatedBy = userId;

    const saved = await this.personalInfoRepo.saveInfo(entity);
    return PersonalInfoMapperResponse.toResponse(saved);
  }
  async updatedByAdminUserPersonalInfo(
    personalInfoId: number,
    dto: AdminUpdatePersonalInfoDto,
    userId: number,
  ) {
    const info =
      await this.personalInfoRepo.findPersonalInfoById(personalInfoId);
    if (!info) {
      throw new NotFoundException(ERRORMESSAGE.NOT_FOUND);
    }
    let userAccountStatus;
    let expectedGraduateYear;
    let branch: Branch | undefined;

    if (dto.branchId) {
      branch = await this.branchService.getBranchEntityById(dto.branchId);

      if (!branch) {
        throw new ConflictException(ERRORMESSAGE.INVALID_REQUEST);
      }
    }

    if (dto.userAccountStatusId) {
      userAccountStatus = await this.enumService.getEnumValueById(
        dto.userAccountStatusId,
      );

      if (!userAccountStatus) {
        throw new ConflictException(ERRORMESSAGE.INVALID_REQUEST);
      }
    }
    if (dto.expectedGraduateYearId) {
      expectedGraduateYear = await this.enumService.getEnumValueById(
        dto.expectedGraduateYearId,
      );

      if (!expectedGraduateYear) {
        throw new ConflictException(ERRORMESSAGE.INVALID_REQUEST);
      }
    }
    const entity = UpdatePersonalInfoMapper.toAdminUpdateEntity(
      info,
      dto,
      userAccountStatus,
      expectedGraduateYear,
      branch,
    );
    entity.updatedBy = userId;
    const saved = await this.personalInfoRepo.saveInfo(entity);
    return PersonalInfoMapperResponse.toResponse(saved);
  }
}
