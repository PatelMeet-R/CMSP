import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PersonalInfoRepository } from '../../data/repository/personal-info-repository';

import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import { BranchService } from 'src/modules/branch/domain/branch.service';
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
    private readonly branchService: BranchService,
  ) {}

  async updatedByUserPersonalInfo(
    personalInfoId: number,
    dto: UpdateByUserPersonalInfoDto,
    userId: number,
  ) {
    const [info, joinedAcademicYear, expectedGraduateYear] = await Promise.all([
      this.personalInfoRepo.findPersonalInfoById(personalInfoId),
      this.enumService.getEnumValueById(dto.joinedAcademicYearId),
      this.enumService.getEnumValueById(dto.expectedGraduateYearId),
    ]);
    if (!info) {
      throw new NotFoundException(ERRORMESSAGE.NOT_FOUND);
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
      joinedAcademicYear,
      expectedGraduateYear,
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
    let enrollnum;

    //validation
    if (dto.enrollmentNumber) {
      enrollnum = await this.personalInfoRepo.isUserExistWithEnrollment(
        dto.enrollmentNumber,
      );

      if (enrollnum) {
        throw new ConflictException(ERRORMESSAGE.ENROLLMENT_TAKEN);
      }
    }

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
