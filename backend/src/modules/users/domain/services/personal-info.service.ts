import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PersonalInfoRepository } from '../../data/repository/personal-info-repository';

import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import { BranchService } from 'src/modules/branch/domain/branch.service';

import type { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { ROLES } from 'src/common/constants/roles.constant';
import { UpdatePersonalInfoMapper } from 'src/modules/users/data/mapper/users.request,mapper';
import type { UpdatePersonalInfoDto } from 'src/modules/users/presentation/dto/request/update-personal-info.dto';
import { PersonalInfoResponseMapper } from 'src/modules/users/data/mapper/users-response.mapper';
import type { FindSubjectQueryDto } from 'src/common/pagination/dto/find-subject-query.dto';

@Injectable()
export class PersonalInfoService {
  constructor(
    private readonly personalInfoRepo: PersonalInfoRepository,
    private readonly enumService: EnumService,
    private readonly branchService: BranchService,
  ) {}

  async getPersonalProfileByAuthId(userId: number) {
    const profile =
      await this.personalInfoRepo.getPersonalProfileByAuthId(userId);
    return PersonalInfoResponseMapper.toResponse(profile);
  }

  async updateSmartProfile(
    targetProfileId: number,
    dto: UpdatePersonalInfoDto,
    currentUser: UserResponseDto,
  ) {
    // 1. Fetch profile
    const targetProfile =
      await this.personalInfoRepo.findPersonalInfoById(targetProfileId);
    if (!targetProfile) throw new NotFoundException(ERRORMESSAGE.NOT_FOUND);

    // 2. Determine permissions
    const isSelf = targetProfile.user?.id === currentUser.id;
    const isAdmin =
      currentUser.role === ROLES.SUPER_ADMIN || currentUser.role === ROLES.HOD;

    // 3. SECURITY GATE: Stop students from editing other students
    if (!isSelf && !isAdmin) {
      throw new ForbiddenException(
        "You do not have permission to edit someone else's profile.",
      );
    }

    // 4. HOD GATE: Make sure HODs can only edit students in their own branch
    if (
      currentUser.role === ROLES.HOD &&
      !isSelf &&
      targetProfile.branch?.id !== currentUser.branchId
    ) {
      throw new ForbiddenException(
        'HODs can only edit profiles within their own branch.',
      );
    }
    if (
      isAdmin &&
      dto.enrollmentNumber &&
      dto.enrollmentNumber !== targetProfile.enrollmentNumber
    ) {
      const exists = await this.personalInfoRepo.isUserExistWithEnrollment(
        dto.enrollmentNumber,
      );
      if (exists) throw new ConflictException(ERRORMESSAGE.ENROLLMENT_TAKEN);
    }
    const relations: any = {};
    if (dto.genderId)
      relations.gender = await this.enumService.getEnumValueById(dto.genderId);
    if (dto.joinedAcademicYearId)
      relations.joinedYear = await this.enumService.getEnumValueById(
        dto.joinedAcademicYearId,
      );
    if (isAdmin) {
      if (dto.branchId)
        relations.branch = await this.branchService.getBranchEntityById(
          dto.branchId,
        );
      if (dto.userAccountStatusId)
        relations.accountStatus = await this.enumService.getEnumValueById(
          dto.userAccountStatusId,
        );
      if (dto.expectedGraduateYearId)
        relations.expectedGradYear = await this.enumService.getEnumValueById(
          dto.expectedGraduateYearId,
        );
    }
    // 1.THE YEAR VALIDATION CHECK
    const joinedYearStr = relations.joinedYear
      ? relations.joinedYear.value
      : targetProfile.joinedAcademicYear?.value;
    const expectedYearStr = relations.expectedGradYear
      ? relations.expectedGradYear.value
      : targetProfile.expectedGraduateYear?.value;

    if (joinedYearStr && expectedYearStr) {
      const joinedYear = Number(joinedYearStr);
      const expectedYear = Number(expectedYearStr);

      if (expectedYear < joinedYear || expectedYear > joinedYear + 6) {
        throw new ConflictException(ERRORMESSAGE.INVALID_YEAR_ENTRY);
      }
    }

    const updatedEntity = UpdatePersonalInfoMapper.toUpdateEntity(
      targetProfile,
      dto,
      isAdmin,
      relations,
    );
    updatedEntity.updatedBy = currentUser.id;

    const saved = await this.personalInfoRepo.saveInfo(updatedEntity);
    return PersonalInfoResponseMapper.toResponse(saved);
  }

  async findAll(
    query: FindSubjectQueryDto,
    currentUserRole,
    currentUserBranchId,
  ) {
    return this.personalInfoRepo.FindAll(
      query,
      currentUserRole,
      currentUserBranchId,
    );
  }
}
