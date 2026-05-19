import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinDate,
  MinLength,
} from 'class-validator';
import { AUTH_DTO_MESSAGE } from 'src/common/constants/dto/auth.dto.message';
import { PI_DTO_MESSAGE } from 'src/common/constants/dto/users-dto/personal-info.dto.message';

export class RegisterSpecificUserDto {
  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.EMAIL.REQUIRED })
  @IsEmail({}, { message: AUTH_DTO_MESSAGE.EMAIL.INVALID })
  email: string;

  @IsUUID(4, { message: AUTH_DTO_MESSAGE.BRANCH_ID.STRING })
  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.BRANCH_ID.REQUIRED })
  branchId: string;

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

  @IsUUID(4, { message: 'Role ID must be a valid UUID' })
  
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: string;

  @IsString()
  @IsNotEmpty({ message: 'Designation is required for staff members.' })
  designation: string;

  @IsString()
  @IsNotEmpty({ message: 'Office location is required.' })
  officeLocation: string;

  @IsOptional()
  @Type(() => Date)
  @MinDate(() => new Date(new Date().setHours(0, 0, 0, 0)), {
    message: 'Joining date cannot be in the past',
  })
  joiningDate?: string;
}
