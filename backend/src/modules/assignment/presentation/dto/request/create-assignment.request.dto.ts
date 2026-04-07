import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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
  @IsNumber({}, { message: ASSIGNMENT_DTO_MESSAGE.SUBJECT_ID.INVALID })
  subjectId: number;

  @IsNotEmpty({ message: ASSIGNMENT_DTO_MESSAGE.BRANCH_ID.REQUIRED })
  @IsNumber({}, { message: ASSIGNMENT_DTO_MESSAGE.BRANCH_ID.INVALID })
  branchId: number;

  @IsNotEmpty({ message: ASSIGNMENT_DTO_MESSAGE.SEMESTER_ID.REQUIRED })
  @IsNumber({}, { message: ASSIGNMENT_DTO_MESSAGE.SEMESTER_ID.INVALID })
  semesterId: number;

  @IsNotEmpty({ message: ASSIGNMENT_DTO_MESSAGE.ACADEMIC_YEAR_ID.REQUIRED })
  @IsNumber({}, { message: ASSIGNMENT_DTO_MESSAGE.ACADEMIC_YEAR_ID.INVALID })
  academicYearId: number;

  @IsOptional()
  @IsNumber({}, { message: ASSIGNMENT_DTO_MESSAGE.ATTACHMENT_ID.INVALID })
  attachmentId?: number;
}
