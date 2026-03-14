import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { ROLES } from 'src/common/constants/roles.constant';
import { ENUM_TYPES } from 'src/common/constants/enum-types.constant';
import { SubjectRepository } from '../../data/repositories/repository';
import { CreateSubjectDto } from '../../presentation/dto/request/subject-register.request.dto';
import { SubjectMapper } from '../../data/mappers/subjectMapper';
import { UpdateSubjectDto } from '../../presentation/dto/request/subject-update.request.dto';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import { BranchService } from 'src/modules/branch/domain/branch.service';

@Injectable()
export class SubjectService {
  constructor(
    private readonly subjectRepository: SubjectRepository,

    private readonly branchService: BranchService,
    private readonly enumService: EnumService,
  ) {}
  //search though code
  async findSubjectByCode(code: string) {
    const subject = await this.subjectRepository.findSubjectByCode(code);

    if (!subject) {
      throw new ConflictException(ERRORMESSAGE.SUBJECT_ALREADY_EXISTS);
    }
    return SubjectMapper.toResponse(subject);
  }
  async registerSubject(dto: CreateSubjectDto, user: UserResponseDto) {
    // check duplicate subject code
    const existingSubject = await this.subjectRepository.findSubjectByCode(
      dto.code,
    );

    // get branch
    const branch = await this.branchService.getBranchEntityById(dto.branchId);

    if (!branch) {
      throw new ConflictException(ERRORMESSAGE.BRANCH_INVALID_CREDENTIALS);
    }

    // get semester enum
    const semester = await this.enumService.getMeEnumValueIfExist(
      ENUM_TYPES.SEMESTER,
      dto.semesterId!.toString(),
    );

    if (!semester) {
      throw new ConflictException(ERRORMESSAGE.SEMESTER_INVALID_CREDENTIALS);
    }
    if (user.role !== ROLES.SUPER_ADMIN && user.branchId !== branch.id) {
      throw new ForbiddenException(ERRORMESSAGE.SUBJECT_CHANGE_NOT_AUTHORIZED);
    }

    const subjectData = SubjectMapper.toEntity(dto, branch, semester);

    const toBeSaved = await this.subjectRepository.saveSubject(subjectData);
    return SubjectMapper.toResponse(toBeSaved);
  }
  async updateSubject(
    id: number,
    dto: UpdateSubjectDto,
    user: UserResponseDto,
  ) {
    const subject = await this.subjectRepository.findSubjectById(id);

    if (!subject) {
      throw new ConflictException(ERRORMESSAGE.SUBJECT_NOT_FOUND);
    }

    const existing = await this.subjectRepository.findSubjectByCode(dto.code!);

    if (existing && existing.id !== id) {
      throw new ConflictException(ERRORMESSAGE.SUBJECT_ALREADY_EXISTS);
    }

    const branch = await this.branchService.getBranchEntityById(dto.branchId!);

    if (!branch) {
      throw new ConflictException(ERRORMESSAGE.BRANCH_INVALID_CREDENTIALS);
    }

    //AUTHORIZATION CHECK
    if (user.role !== ROLES.SUPER_ADMIN && user.branchId !== branch.id) {
      throw new ForbiddenException(ERRORMESSAGE.SUBJECT_CHANGE_NOT_AUTHORIZED);
    }

    const semester = await this.enumService.getMeEnumValueIfExist(
      ENUM_TYPES.SEMESTER,
      dto.semesterId!.toString(),
    );

    if (!semester) {
      throw new ConflictException(ERRORMESSAGE.SEMESTER_INVALID_CREDENTIALS);
    }

    const updatedSubject = SubjectMapper.updateEntity(
      subject,
      dto,
      branch,
      semester,
    );

    const toBeUpdated =
      await this.subjectRepository.saveSubject(updatedSubject);
    return SubjectMapper.toResponse(toBeUpdated);
  }
  async getSubjectById(subjectId: number) {
    const subject = await this.subjectRepository.findSubjectById(subjectId);

    if (!subject) {
      throw new NotFoundException(ERRORMESSAGE.SUBJECT_NOT_FOUND);
    }

    return SubjectMapper.toResponse(subject);
  }
  //hod selection option menu bar
  async getSubjectsByBranch(branchId: number) {
    const subjects =
      await this.subjectRepository.findSubjectsByBranch(branchId);

    if (!subjects) {
      throw new NotFoundException(ERRORMESSAGE.SUBJECT_NOT_FOUND);
    }
    return subjects.map((s) => SubjectMapper.toResponse(s));
  }
  //faculty allocation
  async getSubjectsBySemester(branchId: number, semesterKey: string) {
    const semester = await this.enumService.getMeEnumValueIfExist(
      ENUM_TYPES.SEMESTER,
      semesterKey,
    );
    if (!semester) {
      throw new ConflictException(ERRORMESSAGE.SEMESTER_INVALID_CREDENTIALS);
    }

    const subjects =
      await this.subjectRepository.findSubjectByBranchAndSemester(
        branchId,
        semester.id,
      );
    if (!subjects) {
      throw new ConflictException(ERRORMESSAGE.SUBJECT_NOT_FOUND);
    }

    return subjects.map((s) => SubjectMapper.toResponse(s));
  }
  async getAllSubjects() {
    const subjects = await this.subjectRepository.findAllSubjects();

    if (!subjects.length) {
      throw new NotFoundException(ERRORMESSAGE.SUBJECT_NOT_FOUND);
    }

    return subjects.map((s) => SubjectMapper.toResponse(s));
  }
}
