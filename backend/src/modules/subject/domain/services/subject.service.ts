import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { ROLES } from 'src/common/constants/roles.constant';
import { SubjectRepository } from '../../data/repositories/repository';
import { CreateSubjectDto } from '../../presentation/dto/request/subject-register.request.dto';
import { UpdateSubjectDto } from '../../presentation/dto/request/subject-update.request.dto';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import { BranchService } from 'src/modules/branch/domain/branch.service';
import { FindSubjectQueryDto } from 'src/common/pagination/dto/find-subject-query.dto';
import { SubjectResponseMapper } from 'src/modules/subject/data/mappers/subject/subject-response.mapper';
import { SubjectRequestMapper } from 'src/modules/subject/data/mappers/subject/subject-request.mapper';
import type { User } from 'src/modules/auth/domain/entities/user.entity';

@Injectable()
export class SubjectService {
  constructor(
    private readonly subjectRepository: SubjectRepository,

    private readonly branchService: BranchService,
    private readonly enumService: EnumService,
  ) {}

  //register
  // ======================================

  async registerSubject(dto: CreateSubjectDto, currentUser: User) {
    //  check duplicate subject code
    const isSubjectExist = await this.subjectRepository.IsSubjectWithCodeExist(
      dto.code,
    );

    if (isSubjectExist) {
      throw new ConflictException(
        ERRORMESSAGE.SUBJECT_WITH_CODE_ALREADY_EXISTS,
      );
    }

    // get branch
    const branch = await this.branchService.getBranchEntityById(dto.branchId);
    if (!branch) {
      throw new NotFoundException(ERRORMESSAGE.BRANCH_INVALID_CREDENTIALS);
    }

    const semester = await this.enumService.getEnumValueById(dto.semesterId);

    if (!semester) {
      throw new NotFoundException(ERRORMESSAGE.SEMESTER_INVALID_CREDENTIALS);
    }

    //  AUTHORIZATION CHECK
    const userRoleString = currentUser.role?.key || currentUser.role;
    const userBranchId = currentUser.personalInfo?.branch?.id;

    if (userRoleString !== ROLES.SUPER_ADMIN && userBranchId !== branch.id) {
      throw new ForbiddenException(ERRORMESSAGE.SUBJECT_CHANGE_NOT_AUTHORIZED);
    }

    //  Map and Save
    const subjectData = SubjectRequestMapper.toCreateEntity(
      dto,
      branch,
      semester,
    );

    const toBeSaved = await this.subjectRepository.saveSubject(subjectData);
    return SubjectResponseMapper.toResponse(toBeSaved);
  }

  //update
  // ======================================

  async updateSubject(id: number, dto: UpdateSubjectDto, currentUser: User) {
    const subject = await this.subjectRepository.findSubjectById(id);

    if (!subject) {
      throw new NotFoundException(ERRORMESSAGE.SUBJECT_NOT_FOUND);
    }

    if (dto.code && dto.code !== subject.code) {
      const isCodeTaken = await this.subjectRepository.IsSubjectWithCodeExist(
        dto.code,
      );
      if (isCodeTaken) {
        throw new ConflictException(
          ERRORMESSAGE.SUBJECT_WITH_CODE_ALREADY_EXISTS,
        );
      }
    }

    let branch = subject.branch;
    if (dto.branchId && dto.branchId !== subject.branch?.id) {
      branch = await this.branchService.getBranchEntityById(dto.branchId);
      if (!branch) {
        throw new NotFoundException(ERRORMESSAGE.BRANCH_INVALID_CREDENTIALS);
      }
    }

    const userRoleString = currentUser.role?.key || currentUser.role;
    const userBranchId = currentUser.personalInfo?.branch?.id;

    if (userRoleString !== ROLES.SUPER_ADMIN && userBranchId !== branch?.id) {
      throw new ForbiddenException(ERRORMESSAGE.SUBJECT_CHANGE_NOT_AUTHORIZED);
    }

    // Only fetch new semester if it was changed
    let semester = subject.semester;
    if (dto.semesterId && dto.semesterId !== subject.semester?.id) {
      semester = await this.enumService.getEnumValueById(dto.semesterId);
      if (!semester) {
        throw new NotFoundException(ERRORMESSAGE.SEMESTER_INVALID_CREDENTIALS);
      }
    }

    const updatedSubject = SubjectRequestMapper.toUpdateEntity(
      subject,
      dto,
      branch,
      semester,
    );

    const toBeUpdated =
      await this.subjectRepository.saveSubject(updatedSubject);
    return SubjectResponseMapper.toResponse(toBeUpdated);
  }
  // ======================================

  async getSubjectById(subjectId: number) {
    const subject = await this.subjectRepository.findSubjectById(subjectId);

    if (!subject) {
      throw new NotFoundException(ERRORMESSAGE.SUBJECT_NOT_FOUND);
    }

    return subject;
  }
  // ======================================

  async getAllSubject(
    query: FindSubjectQueryDto,
    currentUserRole,
    currentUserBranchId,
  ) {
    const rawData = await this.subjectRepository.findAll(
      query,
      currentUserRole,
      currentUserBranchId,
    );
    return {
      items: SubjectResponseMapper.toPaginatedResponse(rawData.items),
      meta: rawData.meta,
    };
  }
  // ======================================

  async searchSubjectsForAssignment(
    searchTerm: string,
    semesterId?: number,
    limit: number = 10,
  ) {
    const rawItems = await this.subjectRepository.searchSubjectsForCombobox(
      searchTerm,
      semesterId,
      limit,
    );

    return rawItems.map((subject) => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      semester: subject.semester?.value || null,
      semesterId: subject.semester?.id || null,
    }));
  }
  // ======================================
}
