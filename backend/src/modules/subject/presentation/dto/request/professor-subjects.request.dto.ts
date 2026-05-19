import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { SUBJECT_DTO_MESSAGE } from 'src/common/constants/dto/subject.dto.message';

export class AssignSubjectDto {
  @IsUUID(4, { message: 'professor ID must be a valid UUID' })
  @IsNotEmpty({
    message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.PROFESSOR_ID.REQUIRED,
  })
  professorId: string;

  @IsUUID(4, { message: 'subject ID must be a valid UUID' })
  @IsNotEmpty({
    message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.SUBJECT_ID.REQUIRED,
  })
  subjectId: string;

  @IsUUID(4, { message: 'semester ID must be a valid UUID' })
  @IsNotEmpty({
    message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.SEMESTER_ID.REQUIRED,
  })
  semesterId: string;

  @IsUUID(4, { message: 'academic-year ID must be a valid UUID' })
  @IsNotEmpty({
    message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.ACADEMIC_YEAR_ID.REQUIRED,
  })
  academicYearId: string;
}
