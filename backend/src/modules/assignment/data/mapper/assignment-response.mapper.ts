import { Assignment } from '../../domain/entity/assignment.entity';
import {
  AssignmentResponseDto,
  AssignmentResponseArrayDto,
} from '../../presentation/dto/response/assignment.response.dto';

// assignment.mapper.ts
export class AssignmentResponseMapper {
  static toResponseDto(entity: Assignment): AssignmentResponseDto {
    const dto = new AssignmentResponseDto();

    // Core details
    dto.id = entity.id;
    dto.title = entity.title;
    dto.description = entity.description;
    dto.dueDate = entity.dueDate;
    dto.createdAt = entity.createdAt;

    // Human-readable names
    dto.subjectName = entity.subject?.name;
    dto.branchName = entity.branch?.name;
    dto.semester = entity.semester?.key;

    dto.subjectId = entity.subject?.id;
    dto.branchId = entity.branch?.id;
    dto.semesterId = entity.semester?.id;
    dto.academicYearId = entity.academicYear?.id;

    dto.attachmentUrl = entity.attachment?.url;
    if (entity.attachment) {
      dto.attachmentId = entity.attachment.id;
      dto.originalFilename = entity.attachment.originalName;
    }

    return dto;
  }
  static toSummaryResponseDto(entity: Assignment): AssignmentResponseArrayDto {
    const dto = new AssignmentResponseArrayDto();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.dueDate = entity.dueDate;
    dto.subjectName = entity.subject?.name;
    dto.branchName = entity.branch?.name;
    dto.semester = entity.semester?.key;
    dto.attachmentUrl = entity.attachment?.url;

    return dto;
  }

  static toResponseDtoArray(
    entities: Assignment[],
  ): AssignmentResponseArrayDto[] {
    return entities.map((entity) => this.toSummaryResponseDto(entity));
  }
}
