import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  hasPermission,
  hasAnyPermission,
  isSuperAdmin,
} from 'src/common/utils/permissions/permission.utils';
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
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { BulkCloneAssignmentsDto } from 'src/modules/subject/presentation/dto/request/bulk-clone.dto';
import { ProfessorSubMapping } from 'src/modules/subject/domain/entities/professors-subject.entity';

@Injectable()
export class ProfessorSubMappingService {
  constructor(
    private readonly subjectService: SubjectService,
    private readonly authService: AuthService,
    private readonly enumService: EnumService,
    private professorSubjectRepo: ProfessorSubMappingRepository,
    private readonly staffProfileService: StaffProfileService,
  ) {}
  // ==================================
  async saveAssignedSubject(
    dto: AssignSubjectDto,
    currentUser: UserResponseDto,
  ) {
    const [professor, subject, semester, academicYear, assignedBy] =
      await Promise.all([
        this.authService.getUserByIdWithPersonalInfo(dto.professorId),
        this.subjectService.getSubjectById(dto.subjectId, currentUser),
        this.enumService.getEnumValueById(dto.semesterId),
        this.enumService.getEnumValueById(dto.academicYearId),
        this.authService.getUserByIdWithPersonalInfo(currentUser.id),
      ]);

    if (!professor || !subject || !semester || !academicYear || !assignedBy) {
      throw new ConflictException(ERRORMESSAGE.INVALID_REQUEST);
    }

    if (!assignedBy) {
      throw new UnauthorizedException(
        `${ERRORMESSAGE.USER_NOT_AUTHENTICATED} or ${ERRORMESSAGE.INVALID_TOKEN}`,
      );
    }
    // PBAC Branch Check
    const canManageGlobal = hasPermission(
      currentUser.permissions,
      'subject-mapping:manage-global',
    );
    if (!canManageGlobal) {
      if (
        subject.branch?.id !== currentUser.branchId ||
        professor.personalInfo?.branch?.id !== currentUser.branchId
      ) {
        throw new ForbiddenException(
          'You can only assign subjects to professors within your own branch.',
        );
      }
    }
    const staffProfile = await this.staffProfileService
      .getProfileByUserId(dto.professorId, currentUser)
      .catch(() => null);
    if (!staffProfile)
      throw new ConflictException(
        'This user does not have a Staff Profile and cannot be assigned subjects.',
      );

    const existing = await this.professorSubjectRepo.findExisting(
      dto.professorId,
      dto.subjectId,
      dto.semesterId,
      dto.academicYearId,
    );
    if (existing)
      throw new ConflictException(ERRORMESSAGE.SUBJECT_ALREADY_ASSIGNED);

    const entity = AssignSubjectMapper.toEntity(dto, assignedBy);

    try {
      const saved = await this.professorSubjectRepo.saveAssignedSubject(entity);
      const result =
        await this.professorSubjectRepo.findAssignSubjectByIdWithRelations(
          saved.id,
        );
      return ProfessorMappingResponseMapper.toResponse(result!);
    } catch (error: any) {
      if (error.code === '23505')
        throw new ConflictException(ERRORMESSAGE.SUBJECT_ALREADY_ASSIGNED);
      throw error;
    }
  }
  // ==================================

  async getAllAssignSubjectDetails(
    query: FindSubjectMappingQueryDto,
    currentUser: UserResponseDto,
  ) {
    const canAccessAll = hasPermission(
      currentUser.permissions,
      'assignment:read-all-branches',
    );
    const isSelfOnly =
      !hasPermission(currentUser.permissions, 'assignment:read') &&
      hasPermission(currentUser.permissions, 'assignment:read-self');

    const branchConstraint = canAccessAll ? undefined : currentUser.branchId;
    const isSelfConstraintId = isSelfOnly ? currentUser.id : undefined;

    const rawData = await this.professorSubjectRepo.findAllAssignSubjectDetails(
      query,
      canAccessAll,
      branchConstraint ?? undefined,
      isSelfConstraintId,
    );

    return {
      items: ProfessorMappingResponseMapper.toPaginatedResponse(rawData.items),
      meta: rawData.meta,
    };
  }

  // ==================================

  async getSubjectsByProfessor(professorId: string) {
    const data =
      await this.professorSubjectRepo.findAssignSubjectByProfessorId(
        professorId,
      );

    return ProfessorMappingResponseMapper.toPaginatedResponse(data);
  }

  // ==================================

  // ==================================

  async updateAssignSubject(
    professorSubMappingId: string,
    dto: UpdateAssignSubjectDto,
    currentUser: UserResponseDto,
  ) {
    const existing =
      await this.professorSubjectRepo.findAssignSubjectByIdWithRelations(
        professorSubMappingId,
      );
    if (!existing) throw new NotFoundException(ERRORMESSAGE.NOT_FOUND);

    const updateBy = await this.authService.findUserEntityById(currentUser.id);
    if (!updateBy) throw new UnauthorizedException();

    // PBAC Branch Check
    const canManageGlobal = hasPermission(
      currentUser.permissions,
      'assignment:manage-global',
    );
    if (
      !canManageGlobal &&
      existing.subject?.branch?.id !== currentUser.branchId
    ) {
      throw new ForbiddenException(
        'You cannot update assignments outside your branch.',
      );
    }

    let professor, subject, semester, academicYear;
    if (dto.professorId)
      professor = await this.authService.getUserByIdWithPersonalInfo(
        dto.professorId,
      );
    if (dto.subjectId) {
      subject = await this.subjectService.getSubjectById(
        dto.subjectId,
        currentUser,
      );
      if (!subject)
        throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('Subject'));

      //  THIS Prevent assigning a new subject from outside their branch
      if (!canManageGlobal && subject.branch?.id !== currentUser.branchId) {
        throw new ForbiddenException(
          'You cannot assign a subject from outside your branch.',
        );
      }
    }
    if (dto.semesterId)
      semester = await this.enumService.getEnumValueById(dto.semesterId);
    if (dto.academicYearId)
      academicYear = await this.enumService.getEnumValueById(
        dto.academicYearId,
      );

    const updateEntity = UpdateSubjectMapper.toUpdateAssignSubjectEntity(
      existing,
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
  // ==================================

  async isProfessorAssignedToSubject(
    professorId: string,
    subjectId: string,
    semesterId: string,
    academicYearId: string,
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
  async unassignSubject(mappingId: string, currentUser: UserResponseDto) {
    const mapping =
      await this.professorSubjectRepo.findAssignSubjectByIdWithRelations(
        mappingId,
      );
    if (!mapping)
      throw new NotFoundException(
        ERRORMESSAGE.DATA_NOT_FOUND('Subject Assignment'),
      );

    // PBAC Check
    const canManageGlobal = hasPermission(
      currentUser.permissions,
      'assignment:manage-global',
    );
    if (
      !canManageGlobal &&
      mapping.subject?.branch?.id !== currentUser.branchId
    ) {
      throw new ForbiddenException(
        'You cannot delete assignments outside your branch.',
      );
    }

    mapping.updatedBy = currentUser.id;
    await this.professorSubjectRepo.saveAssignedSubject(mapping);
    await this.professorSubjectRepo.softRemoveMapping(mapping);
    return { success: true, message: 'Subject unassigned successfully' };
  }
  // =======  GET PROFESSOR SUBJECT HISTORY =======

  async getProfessorSubjectHistory(
    professorId: string,
    currentUser: UserResponseDto,
  ) {
    if (currentUser.id !== professorId) {
      const canReadOthers = hasPermission(
        currentUser.permissions,
        'assignment:read',
      );
      if (!canReadOthers)
        throw new ForbiddenException(
          "You cannot view another professor's history.",
        );
    }

    const history =
      await this.professorSubjectRepo.findHistoryByProfessorId(professorId);
    return Object.groupBy(
      history,
      (curr) => curr.academicYear?.key || 'Unknown Year',
    );
  }
  // =============================
  async getMyActiveSubjects(professorId: string, academicYearId: string) {
    if (!academicYearId) return [];
    const mappings = await this.professorSubjectRepo.findMyActiveSubjects(
      professorId,
      academicYearId,
    );

    return mappings.map((m) => ({
      mappingId: m.id,
      subjectId: m.subject.id,
      subjectName: m.subject.name,
      subjectCode: m.subject.code,
      semesterId: m.semester.id,
      semesterName: m.semester.value,
    }));
  }
  // =============================
  async bulkCloneAssignments(
    dto: BulkCloneAssignmentsDto,
    currentUser: UserResponseDto,
  ) {
    // 1. Fetch the requested mappings (even if archived)
    const oldMappings =
      await this.professorSubjectRepo.findMappingsByIdsWithDeleted(
        dto.mappingIdsToClone,
      );

    if (!oldMappings.length) {
      throw new NotFoundException('No valid assignments found to clone.');
    }

    // 2. Fetch the target Academic Year
    const targetYear = await this.enumService.getEnumValueById(
      dto.targetAcademicYearId,
    );
    if (!targetYear)
      throw new NotFoundException('Target Academic Year not found.');

    const assignedBy = await this.authService.findUserEntityById(
      currentUser.id,
    );
    const newAssignments: ProfessorSubMapping[] = [];

    // PBAC Check setup
    const canManageGlobal = hasPermission(
      currentUser.permissions,
      'subject-mapping:manage-global',
    );

    // 3. Process the cloning
    for (const oldMapping of oldMappings) {
      // 🚨 PBAC Gate: Prevent HODs from cloning other branches' data
      if (
        !canManageGlobal &&
        oldMapping.subject.branch.id !== currentUser.branchId
      ) {
        continue; // Skip silently or throw an error, depending on your preference
      }

      // Check if this exact assignment already exists in the target year to prevent duplicates
      const alreadyExists = await this.professorSubjectRepo.findExisting(
        oldMapping.professor.id,
        oldMapping.subject.id,
        oldMapping.semester.id,
        targetYear.id,
      );

      if (!alreadyExists) {
        // Create a fresh entity based on the old one
        const newEntity = new ProfessorSubMapping();
        newEntity.professor = oldMapping.professor;
        newEntity.subject = oldMapping.subject;
        newEntity.semester = oldMapping.semester;
        newEntity.academicYear = targetYear; // 🚨 The new year!
        newEntity.assignedBy = assignedBy;
        newEntity.createdBy = currentUser.id;

        newAssignments.push(newEntity);
      }
    }

    if (newAssignments.length === 0) {
      return {
        message:
          'No new assignments were created (they may already exist or you lack permissions).',
      };
    }

    // 4. Bulk save for performance
    await this.professorSubjectRepo.saveAssignedSubject(newAssignments as any); // Save accepts arrays!

    return {
      message: `Successfully cloned ${newAssignments.length} assignments to the new academic year.`,
    };
  }
  // =============================
  // ==================================
  //  AUTOMATIC UNASSIGN LISTENER
  // ==================================
  @OnEvent('academic-year.changed')
  async handleAcademicYearChange(payload: {
    oldYearId: string;
    newYearId: string;
    triggeredByUserId: string;
  }) {
    console.log(
      `[Event Triggered] Archiving professor assignments for year: ${payload.oldYearId}`,
    );

    await this.professorSubjectRepo.archiveAssignmentsByAcademicYear(
      payload.oldYearId,
      payload.triggeredByUserId,
    );

    console.log(
      '[Event Complete] All professors successfully unassigned from the old academic year.',
    );
  }
}
