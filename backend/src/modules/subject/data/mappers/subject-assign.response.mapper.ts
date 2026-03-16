import { ProfessorSubMapping } from '../../domain/entities/professors-subject.entity';

export class SubjectMapperResponse {
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
