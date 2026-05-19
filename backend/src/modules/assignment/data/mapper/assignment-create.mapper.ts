import { Subject } from 'src/modules/subject/domain/entities/subject.entity';
import { Assignment } from '../../domain/entity/assignment.entity';
import { CreateAssignmentDto } from '../../presentation/dto/request/create-assignment.request.dto';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { File } from 'src/modules/file-upload/domain/entity/file.entity';

export class CreateAssignmentMapper {
  static toEntity(
    dto: CreateAssignmentDto,
    userId: string,
    subject: Subject,
    branch: Branch,
    semester: EnumValue,
    academicYear: EnumValue,
    fileEntity?: File,
  ): Assignment {
    const assignment = new Assignment();
    assignment.title = dto.title;
    assignment.description = dto.description;
    assignment.dueDate = new Date(dto.dueDate);
    assignment.createdBy = userId;

    // Linking Relations by ID
    assignment.subject = subject;
    assignment.branch = branch;
    assignment.semester = semester;
    assignment.academicYear = academicYear;

    // The File Link
    if (dto.attachmentId !== undefined) {
      assignment.attachment = fileEntity;
    }

    return assignment;
  }
}
