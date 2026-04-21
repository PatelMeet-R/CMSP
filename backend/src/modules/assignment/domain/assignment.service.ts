import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Assignment } from './entity/assignment.entity';
import { CreateAssignmentMapper } from '../data/mapper/assignment-create.mapper';
import { CreateAssignmentDto } from '../presentation/dto/request/create-assignment.request.dto';
import { AssignmentRepository } from '../data/repository';
import { FileUploadService } from 'src/modules/file-upload/domain/file-upload.service';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { AssignmentResponseMapper } from '../data/mapper/assignment-response.mapper';
import {
  AssignmentResponseDto,
  AssignmentResponseArrayDto,
} from '../presentation/dto/response/assignment.response.dto';
import { UpdateAssignmentDto } from '../presentation/dto/request/update-assignment.request.dto';
import { SubjectService } from 'src/modules/subject/domain/services/subject.service';
import { BranchService } from 'src/modules/branch/domain/branch.service';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import { AuthService } from 'src/modules/auth/domain/services/auth.service';
import { UpdateAssignmentMapper } from '../data/mapper/assignment-update.mapper';
import { File as FileEntity } from 'src/modules/file-upload/domain/entity/file.entity';
import { ROLES } from 'src/common/constants/roles.constant';
import { ProfessorSubMappingService } from 'src/modules/subject/domain/services/professor-subject-mapping.service';
import { FindAssignmentQueryDto } from 'src/common/pagination/dto/find-assignment-query.dto';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly fileUploadService: FileUploadService,
    private readonly subjectService: SubjectService,
    private readonly branchService: BranchService,
    private readonly enumService: EnumService,
    private readonly authService: AuthService,
    private readonly profSubMappingService: ProfessorSubMappingService,
  ) {}
  //createAssignment
  async create(
    dto: CreateAssignmentDto,
    userId: number,
    branchId: number,
    userRole: string,
  ): Promise<Assignment> {
    if (userRole === ROLES.PROFESSOR) {
      const isAuthorized =
        await this.profSubMappingService.isProfessorAssignedToSubject(
          userId,
          dto.subjectId,
          dto.semesterId,
          dto.academicYearId,
        );
      if (!isAuthorized) {
        throw new ForbiddenException(
          ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.NOT_AUTHORIZED_SUBJECT,
        );
      }
    }
    const [user, subject, branch, semester, academicYear, fileRaw] =
      await Promise.all([
        this.authService.findUserEntityById(userId),
        this.subjectService.getSubjectById(dto.subjectId),
        this.branchService.getBranchEntityById(branchId),
        this.enumService.getEnumValueById(dto.semesterId),
        this.enumService.getEnumValueById(dto.academicYearId),
        dto.attachmentId
          ? this.fileUploadService.findFileEntityById(dto.attachmentId)
          : undefined,
      ]);
    const file = fileRaw ?? undefined;
    if (!user) {
      throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
    }
    if (!subject || !branch || !semester || !academicYear) {
      throw new BadRequestException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.INVALID_RELATION,
      );
    }
    if (dto.attachmentId && !file) {
      throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('file'));
    }
    //Mapping and Saving
    const entity = CreateAssignmentMapper.toEntity(
      dto,
      userId,
      subject,
      branch,
      semester,
      academicYear,
      file,
    );
    await this.assignmentRepository.clearPaginationCache();
    return await this.assignmentRepository.saveAssignment(entity);
  }

  //updateAssignment
  async update(
    assignmentId: number,
    dto: UpdateAssignmentDto,
    userId: number,
    userRole: string,
  ) {
    // 1. Fetch the existing assignment with its attachment
    const oldAssignment =
      await this.assignmentRepository.findAssignmentByIdWithAttachmentRelation(
        assignmentId,
      );

    if (!oldAssignment)
      throw new NotFoundException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.NOT_FOUND(assignmentId),
      );
    if (userRole === ROLES.PROFESSOR && oldAssignment.createdBy !== userId) {
      throw new ForbiddenException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.NOT_OWNER,
      );
    }

    let fileEntity: FileEntity | null | undefined = undefined;

    // 2. Handle Attachment Logic (Cases A, B, and C)
    if (dto.attachmentId !== undefined) {
      // If dto.attachmentId is null, it means user wants to REMOVE the file
      // If it's a number, they want to REPLACE/ADD a file

      // Cleanup old file if it exists and is being replaced or removed
      if (
        oldAssignment.attachment &&
        oldAssignment.attachment.id !== dto.attachmentId
      ) {
        await this.fileUploadService.remove(oldAssignment.attachment.id);
      }

      // Prepare the new entity link
      if (dto.attachmentId === null) {
        fileEntity = null; // User explicitly wants to clear the file
      } else {
        // Fetch the new file entity to pass to mapper
        fileEntity = await this.fileUploadService.findFileEntityById(
          dto.attachmentId,
        );
        if (!fileEntity)
          throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('file'));
      }
    }

    // 3. Fetch other relations only if they are being updated (Performance)
    const subject = dto.subjectId
      ? await this.subjectService.getSubjectById(dto.subjectId)
      : undefined;
    const semester = dto.semesterId
      ? await this.enumService.getEnumValueById(dto.semesterId)
      : undefined;

    // 4. Map and Save
    const entity = UpdateAssignmentMapper.toEntity(
      oldAssignment,
      dto,
      userId,
      subject,
      semester,
      fileEntity, // Now passing the actual Entity or null,
    );
    await this.assignmentRepository.clearSingleAssignmentCache(entity.id);
    await this.assignmentRepository.clearPaginationCache();
    return await this.assignmentRepository.saveAssignment(entity);
  }

  //RemoveAssignment
  async remove(
    assignmentId: number,
    userId: number,
    userRole: string,
    userBranchId?: number | null,
  ): Promise<void> {
    const assignment =
      await this.assignmentRepository.findAssignmentByIdWithAttachmentRelation(
        assignmentId,
      );

    if (!assignment) {
      throw new NotFoundException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.NOT_FOUND(assignmentId),
      );
    }
    // RESOURCE AUTHORIZATION CHECK FOR DELETE

    if (userRole === ROLES.PROFESSOR) {
      //Own Assignment Check
      if (assignment.createdBy !== userId) {
        throw new ForbiddenException(
          ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.DELETE_NOT_OWNER,
        );
      }
    } else if (userRole === ROLES.HOD) {
      if (!userBranchId) {
        throw new ForbiddenException(
          ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.BRANCH_MISSING,
        );
      }
      if (assignment.branch.id !== userBranchId) {
        throw new ForbiddenException(
          ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.HOD_BRANCH_MISMATCH,
        );
      }
    }
    const attachmentIdToRemove = assignment.attachment?.id;

    await this.assignmentRepository.removeAssignment(assignment);

    //Super_Admin can do anything
    if (attachmentIdToRemove) {
      try {
        await this.fileUploadService.remove(attachmentIdToRemove);
        await this.assignmentRepository.clearSingleAssignmentCache(
          attachmentIdToRemove,
        );
        await this.assignmentRepository.clearPaginationCache();
      } catch (error) {
        console.error(
          ` [SERVICE] Cloudinary Cleanup Failed for Attachment ID ${attachmentIdToRemove}:`,
          error,
        );
      }
    }
  }

  //findAllByFilter
  // async findAllAssignmentByFilter(
  //   branchId: number,
  //   semesterId: number,
  // ): Promise<AssignmentResponseArrayDto[]> {
  //   const data: Assignment[] = await this.assignmentRepository.findAllByFilter(
  //     branchId,
  //     semesterId,
  //   );
  //   return AssignmentResponseMapper.toResponseDtoArray(data);
  // }
  //findOne

  // ==============
  async findAssignmentByIdWithAllRelation(
    id: number,
  ): Promise<AssignmentResponseDto> {
    const assignment =
      await this.assignmentRepository.findAssignmentByIdWithAllRelation(id);
    if (!assignment) {
      throw new NotFoundException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.NOT_FOUND(id),
      );
    }
    return AssignmentResponseMapper.toResponseDto(assignment);
  }

  // =========================
  async getAllAssignments(
    query: FindAssignmentQueryDto,
    userRole: string,
    userBranchId?: number,
  ) {
    const effectiveBranchId =
      userRole === ROLES.SUPER_ADMIN ? query.branchId : userBranchId;

    const rawData =
      await this.assignmentRepository.findAllAssignmentsWithFilters(
        query,
        effectiveBranchId,
        userRole,
      );

    return {
      items: AssignmentResponseMapper.toResponseDtoArray(rawData.items),
      meta: rawData.meta,
    };
  }
  // =========================
  // =========================
}
