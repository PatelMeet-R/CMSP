import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ASSIGNMENT_DTO_MESSAGE } from 'src/common/constants/dto/assignment.dto.message';

export class CreateAssignmentDto {
  @IsNotEmpty({ message: ASSIGNMENT_DTO_MESSAGE.TITLE.REQUIRED })
  @IsString({ message: ASSIGNMENT_DTO_MESSAGE.TITLE.INVALID })
  title: string;

  @IsNotEmpty({ message: ASSIGNMENT_DTO_MESSAGE.DESCRIPTION.REQUIRED })
  @IsString({ message: ASSIGNMENT_DTO_MESSAGE.DESCRIPTION.INVALID })
  description: string;

  @IsNotEmpty({ message: ASSIGNMENT_DTO_MESSAGE.DUE_DATE.REQUIRED })
  @IsDateString({}, { message: ASSIGNMENT_DTO_MESSAGE.DUE_DATE.INVALID })
  dueDate: string;

  @IsNotEmpty({ message: ASSIGNMENT_DTO_MESSAGE.SUBJECT_ID.REQUIRED })
  @IsUUID(4, { message: 'Subject ID must be a valid UUID' })
  subjectId: string;

  @IsNotEmpty({ message: ASSIGNMENT_DTO_MESSAGE.BRANCH_ID.REQUIRED })
  @IsUUID(4, { message: 'Branch ID must be a valid UUID' })
  branchId: string;

  @IsNotEmpty({ message: ASSIGNMENT_DTO_MESSAGE.SEMESTER_ID.REQUIRED })
  @IsUUID(4, { message: 'Semester ID must be a valid UUID' })
  semesterId: string;

  @IsNotEmpty({ message: ASSIGNMENT_DTO_MESSAGE.ACADEMIC_YEAR_ID.REQUIRED })
  @IsUUID(4, { message: 'acedemic Year ID must be a valid UUID' })
  academicYearId: string;

  @IsOptional()
  @IsUUID(4, { message: 'Attachment ID must be a valid UUID' })
  attachmentId?: string;
}
