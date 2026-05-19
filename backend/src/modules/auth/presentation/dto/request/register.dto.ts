import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Length,
  IsUUID,
} from 'class-validator';
import { AUTH_DTO_MESSAGE } from 'src/common/constants/dto/auth.dto.message';
import { PI_DTO_MESSAGE } from 'src/common/constants/dto/users-dto/personal-info.dto.message';

export class RegisterStudentDto {
  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.EMAIL.REQUIRED })
  @IsEmail({}, { message: AUTH_DTO_MESSAGE.EMAIL.INVALID })
  email: string;

  @MinLength(2, { message: AUTH_DTO_MESSAGE.NAME.MIN_LENGTH('first', 2) })
  @MaxLength(50, { message: AUTH_DTO_MESSAGE.NAME.MAX_LENGTH('first', 50) })
  @IsNotEmpty({ message: PI_DTO_MESSAGE.FIRST_NAME.REQUIRED })
  @IsString({ message: PI_DTO_MESSAGE.FIRST_NAME.STRING })
  firstName: string;

  @MinLength(2, { message: AUTH_DTO_MESSAGE.NAME.MIN_LENGTH('last', 2) })
  @MaxLength(50, { message: AUTH_DTO_MESSAGE.NAME.MAX_LENGTH('last', 50) })
  @IsNotEmpty({ message: PI_DTO_MESSAGE.LAST_NAME.REQUIRED })
  @IsString({ message: PI_DTO_MESSAGE.LAST_NAME.STRING })
  lastName: string;

  @Length(12, 12, { message: PI_DTO_MESSAGE.ENROLLMENT_NUMBER.LENGTH(12) })
  @IsNotEmpty({ message: PI_DTO_MESSAGE.ENROLLMENT_NUMBER.REQUIRED })
  @IsString({ message: PI_DTO_MESSAGE.ENROLLMENT_NUMBER.STRING })
  enrollmentNumber: string;

  @IsUUID(4, { message: AUTH_DTO_MESSAGE.BRANCH_ID.STRING })
  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.BRANCH_ID.REQUIRED })
  branchId: string;

  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.PASSWORD.REQUIRED })
  @MinLength(6, { message: AUTH_DTO_MESSAGE.PASSWORD.MIN_LENGTH(6) })
  password: string;
}
