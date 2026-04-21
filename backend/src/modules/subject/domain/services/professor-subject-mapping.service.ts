import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfessorSubMappingRepository } from '../../data/repositories/professor-subject-mapping-repository';
import { AssignSubjectDto } from '../../presentation/dto/request/professor-subjects.request.dto';
import { AssignSubjectMapper } from '../../data/mappers/subject-mapping/subject-assign.mapper';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { SubjectService } from './subject.service';
import { AuthService } from 'src/modules/auth/domain/services/auth.service';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import { UpdateAssignSubjectDto } from '../../presentation/dto/request/professor-subjects-update.request.dto';
import { UpdateSubjectMapper } from '../../data/mappers/subject-mapping/subject-assign-update.mapper';
import { FindSubjectMappingQueryDto } from 'src/common/pagination/dto/find-subject-mapping-query.dto';
import { ProfessorMappingResponseMapper } from 'src/modules/subject/data/mappers/subject-mapping/subject-mapping-response';
import { StaffProfileService } from 'src/modules/users/domain/services/staff-profile.service';
import { map } from 'rxjs';

@Injectable()
export class ProfessorSubMappingService {
  constructor(
    private readonly subjectService: SubjectService,
    private readonly authService: AuthService,
    private readonly enumService: EnumService,
    private professorSubjectRepo: ProfessorSubMappingRepository,
    private readonly staffProfileService: StaffProfileService,
  ) {}

  async saveAssignedSubject(dto: AssignSubjectDto, assignedById: number) {
    const [professor, subject, semester, academicYear, assignedBy] =
      await Promise.all([
        this.authService.getUserByIdWithPersonalInfo(dto.professorId),
        this.subjectService.getSubjectById(dto.subjectId),
        this.enumService.getEnumValueById(dto.semesterId),
        this.enumService.getEnumValueById(dto.academicYearId),
        this.authService.getUserByIdWithPersonalInfo(assignedById),
      ]);

    if (!professor || !subject || !semester || !academicYear) {
      throw new ConflictException(ERRORMESSAGE.INVALID_REQUEST);
    }

    if (!assignedBy) {
      throw new UnauthorizedException(
        `${ERRORMESSAGE.USER_NOT_AUTHENTICATED} or ${ERRORMESSAGE.INVALID_TOKEN}`,
      );
    }
    const staffProfile = await this.staffProfileService
      .getProfileByUserId(dto.professorId)
      .catch(() => null);

    if (!staffProfile) {
      throw new ConflictException(
        'This user does not have a Staff Profile and cannot be assigned subjects.',
      );
    }

    const existing = await this.professorSubjectRepo.findExisting(
      dto.professorId,
      dto.subjectId,
      dto.semesterId,
      dto.academicYearId,
    );

    if (existing) {
      throw new ConflictException(ERRORMESSAGE.SUBJECT_ALREADY_ASSIGNED);
    }

    const entity = AssignSubjectMapper.toEntity(dto, assignedBy);

    let saved;
    try {
      saved = await this.professorSubjectRepo.saveAssignedSubject(entity);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(ERRORMESSAGE.SUBJECT_ALREADY_ASSIGNED);
      }
      throw error;
    }

    const result =
      await this.professorSubjectRepo.findAssignSubjectByIdWithRelations(
        saved.id,
      );
    return ProfessorMappingResponseMapper.toResponse(result!);
  }

  async getSubjectsByProfessor(professorId: number) {
    const data =
      await this.professorSubjectRepo.findAssignSubjectByProfessorId(
        professorId,
      );

    return ProfessorMappingResponseMapper.toPaginatedResponse(data);
  }
  async getAllAssignSubjectDetails(
    query: FindSubjectMappingQueryDto,
    currentUserId,
    currentUserRole?,
    currentUserBranchId?,
  ) {
    const rawData = await this.professorSubjectRepo.findAllAssignSubjectDetails(
      query,
      currentUserId,
      currentUserRole,
      currentUserBranchId,
    );
    return {
      items: ProfessorMappingResponseMapper.toPaginatedResponse(rawData.items),
      meta: rawData.meta,
    };
  }

  async updateAssignSubject(
    professorSubMappingId: number,
    dto: UpdateAssignSubjectDto,
    updatedById: number,
  ) {
    const existingProfessorSubMapping =
      await this.professorSubjectRepo.findAssignSubjectByIdWithRelations(
        professorSubMappingId,
      );
    if (!existingProfessorSubMapping) {
      throw new NotFoundException(ERRORMESSAGE.NOT_FOUND);
    }
    const updateBy = await this.authService.findUserEntityById(updatedById);
    if (!updateBy) {
      throw new UnauthorizedException(ERRORMESSAGE.INVALID_REQUEST);
    }

    let professor, subject, semester, academicYear;
    if (dto.professorId) {
      professor = await this.authService.getUserByIdWithPersonalInfo(
        dto.professorId,
      );
      if (!professor) {
        throw new NotFoundException(
          ERRORMESSAGE.DATA_NOT_FOUND('Professor Name'),
        );
      }
    }
    if (dto.subjectId) {
      subject = await this.subjectService.getSubjectById(dto.subjectId);
      if (!subject) {
        throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('Subject'));
      }
    }
    if (dto.semesterId) {
      semester = await this.enumService.getEnumValueById(dto.semesterId);
      if (!semester)
        throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('semester'));
    }
    if (dto.academicYearId) {
      academicYear = await this.enumService.getEnumValueById(
        dto.academicYearId,
      );
      if (!academicYear)
        throw new NotFoundException(
          ERRORMESSAGE.DATA_NOT_FOUND('Academic Year'),
        );
    }

    const updateEntity = UpdateSubjectMapper.toUpdateAssignSubjectEntity(
      existingProfessorSubMapping,
      professor,
      subject,
      semester,
      academicYear,
    );
    updateEntity.updatedBy = updateBy.id;
    const saved =
      await this.professorSubjectRepo.saveAssignedSubject(updateEntity);

    const result =
      await this.professorSubjectRepo.findAssignSubjectByIdWithRelations(
        saved.id,
      );
    return ProfessorMappingResponseMapper.toResponse(result!);
  }

  async isProfessorAssignedToSubject(
    professorId: number,
    subjectId: number,
    semesterId: number,
    academicYearId: number,
  ): Promise<boolean> {
    const existing = await this.professorSubjectRepo.findExisting(
      professorId,
      subjectId,
      semesterId,
      academicYearId,
    );

    // Returns true if the mapping exists, false if it doesn't
    return !!existing;
  }
  // ============== UNASSIGN SUBJECT  ===============
  async unassignSubject(mappingId: number, currentUserId: number) {
    const mapping =
      await this.professorSubjectRepo.findAssignSubjectByIdWithRelations(
        mappingId,
      );
    if (!mapping) {
      throw new NotFoundException(
        ERRORMESSAGE.DATA_NOT_FOUND('Subject Assignment'),
      );
    }
    mapping.updatedBy = currentUserId;
    const mappingToSoftDelete =
      await this.professorSubjectRepo.saveAssignedSubject(mapping);

    await this.professorSubjectRepo.softRemoveMapping(mapping);
    return { success: true, message: 'Subject unassigned successfully' };
  }

  // =======  GET PROFESSOR SUBJECT HISTORY =======

  async getProfessorSubjectHistory(professorId: number) {
    const history =
      await this.professorSubjectRepo.findHistoryByProfessorId(professorId);

    const groupedHistory = Object.groupBy(
      history,
      (curr) => curr.academicYear?.key || 'Unknown Year',
    );

    return groupedHistory;
  }
  // =============================
  // =============================
}
