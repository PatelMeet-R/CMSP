import {
  BadRequestException,
  ForbiddenException,
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
import { ProfessorSubMappingService } from 'src/modules/subject/domain/services/professor-subject-mapping.service';
import { FindAssignmentQueryDto } from 'src/common/pagination/dto/find-assignment-query.dto';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

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
    currentUser: UserResponseDto,
  ): Promise<Assignment> {
    if (!currentUser.branchId)
      throw new UnauthorizedException(
        'User branch is required to create assignments.',
      );

    const canManageGlobal =
      currentUser.permissions.includes('assignment:manage-global') ||
      currentUser.permissions.includes('*:*');
    if (!canManageGlobal) {
      const isAuthorized =
        await this.profSubMappingService.isProfessorAssignedToSubject(
          currentUser.id,
          dto.subjectId,
          dto.semesterId,
          dto.academicYearId,
        );
      if (!isAuthorized)
        throw new ForbiddenException(
          ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.NOT_AUTHORIZED_SUBJECT,
        );
    }

    const [user, subject, branch, semester, academicYear, fileRaw] =
      await Promise.all([
        this.authService.findUserEntityById(currentUser.id),
        this.subjectService.getSubjectById(dto.subjectId),
        this.branchService.getBranchEntityById(currentUser.branchId),
        this.enumService.getEnumValueById(dto.semesterId),
        this.enumService.getEnumValueById(dto.academicYearId),
        dto.attachmentId
          ? this.fileUploadService.findFileEntityById(dto.attachmentId)
          : undefined,
      ]);
    if (!user) {
      throw new UnauthorizedException(ERRORMESSAGE.USERNOTEXIST);
    }
    if (!subject || !branch || !semester || !academicYear) {
      throw new BadRequestException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.INVALID_RELATION,
      );
    }
    if (dto.attachmentId && !fileRaw) {
      throw new NotFoundException(ERRORMESSAGE.DATA_NOT_FOUND('file'));
    }
    //Mapping and Saving
    const entity = CreateAssignmentMapper.toEntity(
      dto,
      currentUser.id,
      subject,
      branch,
      semester,
      academicYear,
      fileRaw ?? undefined,
    );
    await this.assignmentRepository.clearPaginationCache();
    return await this.assignmentRepository.saveAssignment(entity);
  }

  //updateAssignment
  async update(
    assignmentId: string,
    dto: UpdateAssignmentDto,
    currentUser: UserResponseDto,
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

    const canManageGlobal =
      currentUser.permissions.includes('assignment:manage-global') ||
      currentUser.permissions.includes('*:*');
    const canManageOthers = currentUser.permissions.includes(
      'assignment:manage-others',
    );
    const isOwner = oldAssignment.createdBy === currentUser.id;

    // 1. Permission Check: Must be owner, global, or have permission to manage others
    if (!isOwner && !canManageOthers && !canManageGlobal) {
      throw new ForbiddenException('You can only modify your own assignments.');
    }

    // 2. Branch Isolation Check: If they are managing someone else, they must be in the same branch (unless global)
    if (
      !isOwner &&
      !canManageGlobal &&
      oldAssignment.branch.id !== currentUser.branchId
    ) {
      throw new ForbiddenException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.HOD_BRANCH_MISMATCH,
      );
    }
    let fileEntity: FileEntity | null | undefined = undefined;
    let oldFileIdToDelete: string | null = null;

    if (dto.attachmentId !== undefined) {
      if (
        oldAssignment.attachment &&
        oldAssignment.attachment.id !== dto.attachmentId
      ) {
        oldFileIdToDelete = oldAssignment.attachment.id;
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
      currentUser.id,
      subject,
      semester,
      fileEntity, // Now passing the actual Entity or null,
    );

    const savedAssignment =
      await this.assignmentRepository.saveAssignment(entity);

    if (oldFileIdToDelete) {
      await this.fileUploadService.systemRemove(oldFileIdToDelete);
    }

    await this.assignmentRepository.clearSingleAssignmentCache(entity.id);

    await this.assignmentRepository.clearPaginationCache();

    return savedAssignment;
  }

  //RemoveAssignment
  async remove(
    assignmentId: string,
    currentUser: UserResponseDto,
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

    const canManageGlobal =
      currentUser.permissions.includes('assignment:manage-global') ||
      currentUser.permissions.includes('*:*');
    const canManageOthers = currentUser.permissions.includes(
      'assignment:manage-others',
    );
    const isOwner = assignment.createdBy === currentUser.id;

    // 1. Permission Check
    if (!isOwner && !canManageOthers && !canManageGlobal) {
      throw new ForbiddenException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.DELETE_NOT_OWNER,
      );
    }

    // 2. Branch Isolation Check
    if (
      !isOwner &&
      !canManageGlobal &&
      assignment.branch.id !== currentUser.branchId
    ) {
      throw new ForbiddenException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.HOD_BRANCH_MISMATCH,
      );
    }

    const attachmentIdToRemove = assignment.attachment?.id;

    await this.assignmentRepository.removeAssignment(assignment);

    //Super_Admin can do anything
    if (attachmentIdToRemove) {
      try {
        await this.fileUploadService.systemRemove(attachmentIdToRemove);
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

  //findOne

  // ==============
  async findAssignmentByIdWithAllRelation(
    id: string,
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
    currentUser: UserResponseDto,
  ) {
    const canAccessAll =
      currentUser.permissions.includes('assignment:read-all-branches') ||
      currentUser.permissions.includes('*:*');
    const isSelfOnly =
      !currentUser.permissions.includes('assignment:read') &&
      currentUser.permissions.includes('assignment:read-self');

    const branchConstraint = canAccessAll ? undefined : currentUser.branchId;
    const isSelfConstraintId = isSelfOnly ? currentUser.id : undefined;

    const rawData =
      await this.assignmentRepository.findAllAssignmentsWithFilters(
        query,
        canAccessAll,
        branchConstraint ?? undefined,
        isSelfConstraintId,
      );

    return {
      items: AssignmentResponseMapper.toResponseDtoArray(rawData.items),
      meta: rawData.meta,
    };
  }
  // =========================

  async getMyAssignments(query: FindAssignmentQueryDto, userId: string) {
    const rawData =
      await this.assignmentRepository.findAllAssignmentsWithFilters(
        query,
        false,
        undefined,
        userId,
      );

    return {
      items: AssignmentResponseMapper.toResponseDtoArray(rawData.items),
      meta: rawData.meta,
    };
  }
  // =========================
  // =========================
}
