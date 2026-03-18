import { Assignment } from '../../domain/entity/assignment.entity';
import { AssignmentResponseDto } from '../../presentation/dto/response/assignment.response.dto';

// assignment.mapper.ts
export class AssignmentResponseMapper {
  static toResponseDto(entity: Assignment): AssignmentResponseDto {
    const dto = new AssignmentResponseDto();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.description = entity.description;
    dto.dueDate = entity.dueDate;
    dto.subjectName = entity.subject?.name;
    dto.branchName = entity.branch?.name;
    dto.semester = entity.semester?.key; // From EnumValue
    dto.attachmentUrl = entity.attachment?.url; // File URL here
    dto.createdAt = entity.createdAt;

    return dto;
  }

  static toResponseDtoArray(entities: Assignment[]): AssignmentResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity));
  }
}
