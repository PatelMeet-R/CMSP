import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsInt,
} from 'class-validator';
import { SUBJECT_DTO_MESSAGE } from 'src/common/constants/dto/subject.dto.message';

export class CreateSubjectDto {
  @IsInt({ message: SUBJECT_DTO_MESSAGE.SEMESTER_ID.INTEGER })
  @IsNotEmpty({ message: SUBJECT_DTO_MESSAGE.SEMESTER_ID.REQUIRED })
  semesterId: number;

  @IsInt({ message: SUBJECT_DTO_MESSAGE.BRANCH_ID.INTEGER })
  @IsNotEmpty({ message: SUBJECT_DTO_MESSAGE.BRANCH_ID.REQUIRED })
  branchId: number;

  @IsString({ message: SUBJECT_DTO_MESSAGE.NAME.STRING })
  @IsNotEmpty({ message: SUBJECT_DTO_MESSAGE.NAME.REQUIRED })
  @MinLength(3, { message: SUBJECT_DTO_MESSAGE.NAME.MIN(3) })
  @MaxLength(50, { message: SUBJECT_DTO_MESSAGE.NAME.MAX(50) })
  name: string;

  @IsString({ message: SUBJECT_DTO_MESSAGE.CODE.STRING })
  @IsNotEmpty({ message: SUBJECT_DTO_MESSAGE.CODE.REQUIRED })
  @MinLength(3, { message: SUBJECT_DTO_MESSAGE.CODE.MIN(3) })
  @MaxLength(20, { message: SUBJECT_DTO_MESSAGE.CODE.MAX(20) })
  code: string;
}
