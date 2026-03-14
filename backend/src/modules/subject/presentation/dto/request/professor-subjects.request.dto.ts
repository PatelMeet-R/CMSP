import { IsInt, IsNotEmpty } from 'class-validator';
import { SUBJECT_DTO_MESSAGE } from 'src/common/constants/dto/subject.dto.message';

export class AssignSubjectDto {
  @IsInt({ message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.PROFESSOR_ID.INTEGER })
  @IsNotEmpty({
    message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.PROFESSOR_ID.REQUIRED,
  })
  professorId: number;

  @IsInt({ message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.SUBJECT_ID.INTEGER })
  @IsNotEmpty({
    message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.SUBJECT_ID.REQUIRED,
  })
  subjectId: number;

  @IsInt({ message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.SEMESTER_ID.INTEGER })
  @IsNotEmpty({
    message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.SEMESTER_ID.REQUIRED,
  })
  semesterId: number;

  @IsInt({
    message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.ACADEMIC_YEAR_ID.INTEGER,
  })
  @IsNotEmpty({
    message: SUBJECT_DTO_MESSAGE.ASSIGN_SUBJECT.ACADEMIC_YEAR_ID.REQUIRED,
  })
  academicYearId: number;
}
