import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { ProfessorSubMapping } from '../../../domain/entities/professors-subject.entity';
import { Subject } from '../../../domain/entities/subject.entity';
import { User } from 'src/modules/auth/domain/entities/user.entity';

export class UpdateSubjectMapper {
  static toUpdateAssignSubjectEntity(
    entity: ProfessorSubMapping,
    professor?: User,
    subject?: Subject,
    semester?: EnumValue,
    academicYear?: EnumValue,
  ) {
    if (subject !== undefined) {
      entity.subject = subject;
    }
    if (semester !== undefined) {
      entity.semester = semester;
    }
    if (academicYear !== undefined) {
      entity.academicYear = academicYear;
    }
    if (professor !== undefined) entity.professor = professor;
    return entity;
  }
}
