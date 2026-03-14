import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { AUTH_DTO_MESSAGE } from 'src/common/constants/dto/auth.dto.message';

export class RegisterDto {
  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.EMAIL.REQUIRED })
  @IsEmail({}, { message: AUTH_DTO_MESSAGE.EMAIL.INVALID })
  email: string;

  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.NAME.REQUIRED })
  @IsString({ message: AUTH_DTO_MESSAGE.NAME.MUST_BE_STRING })
  @MinLength(3, { message: AUTH_DTO_MESSAGE.NAME.MIN_LENGTH(3) })
  @MaxLength(50, { message: AUTH_DTO_MESSAGE.NAME.MAX_LENGTH(50) })
  name: string;

  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.PASSWORD.REQUIRED })
  @MinLength(6, { message: AUTH_DTO_MESSAGE.PASSWORD.MIN_LENGTH(6) })
  password: string;
}
