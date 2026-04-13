import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AUTH_DTO_MESSAGE } from 'src/common/constants/dto/auth.dto.message';
import { PI_DTO_MESSAGE } from 'src/common/constants/dto/users-dto/personal-info.dto.message';

export class RegisterSpecificUserDto {
  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.EMAIL.REQUIRED })
  @IsEmail({}, { message: AUTH_DTO_MESSAGE.EMAIL.INVALID })
  email: string;
  @IsInt({ message: AUTH_DTO_MESSAGE.BRANCH_ID.INTEGER })
  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.BRANCH_ID.REQUIRED })
  branchId: number;

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

  @IsInt({ message: 'Role ID must be an integer' })
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: number;
}
