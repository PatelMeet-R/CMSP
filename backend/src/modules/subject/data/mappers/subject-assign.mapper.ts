import { User } from 'src/modules/auth/domain/entities/user.entity';
import { ProfessorSubMapping } from '../../domain/entities/professors-subject.entity';
import { AssignSubjectDto } from '../../presentation/dto/request/professor-subjects.request.dto';
import { Subject } from 'src/modules/subject/domain/entities/subject.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';

export class AssignSubjectMapper {
  static toEntity(dto: AssignSubjectDto, admin: User): ProfessorSubMapping {
    const assignment = new ProfessorSubMapping();

    assignment.professor = { id: dto.professorId } as User;

    assignment.subject = { id: dto.subjectId } as Subject;

    assignment.semester = { id: dto.semesterId } as EnumValue;

    assignment.academicYear = { id: dto.academicYearId } as EnumValue;

    assignment.assignedBy = admin;

    return assignment;
  }
  static toResponse(data: ProfessorSubMapping) {
    return {
      id: data.id,
      professor: data.professor.personalInfo.fullName,
      subject: data.subject?.name,
      semester: data.semester?.value,
      academicYear: data.academicYear?.value,
      assignedBy: data.assignedBy.personalInfo.fullName,
    };
  }
  static toResponseProfessorSubjects(data: ProfessorSubMapping) {
    return {
      subject: data.subject?.name,
      semester: data.semester?.value,
      academicYear: data.academicYear?.value,
    };
  }
}
