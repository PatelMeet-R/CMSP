import { Subject } from 'src/modules/subject/domain/entities/subject.entity';
import { Assignment } from '../../domain/entity/assignment.entity';
import { UpdateAssignmentDto } from '../../presentation/dto/request/update-assignment.request.dto';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
// Instead of: import { File } from '...';
import { File as FileEntity } from 'src/modules/file-upload/domain/entity/file.entity';
// update-assignment.mapper.ts
export class UpdateAssignmentMapper {
  static toEntity(
    entity: Assignment,
    dto: UpdateAssignmentDto,
    userId: string,
    subject?: Subject,
    semester?: EnumValue,
    fileEntity?: FileEntity | null, // Accept File for update, null for removal
  ): Assignment {
    entity.updatedBy = userId;

    // Only update if the value was actually passed in the DTO
    if (subject) entity.subject = subject;
    if (semester) entity.semester = semester;

    // // Handle Case A, B, and C
    // if (fileEntity !== undefined) {
    //   entity.attachment = fileEntity;
    // }
    // update-assignment.mapper.ts

    // Handle Case A, B, and C
    if (fileEntity !== undefined) {
      // We cast it as 'any' because TypeORM requires 'null' to delete the foreign key,
      // even though the strict TypeScript interface expects 'undefined'.
      entity.attachment = fileEntity as any;
    }

    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.dueDate) entity.dueDate = new Date(dto.dueDate);

    return entity;
  }
}
