import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { AUTH_DTO_MESSAGE } from 'src/common/constants/dto/auth.dto.message';

export class LoginDto {
  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.EMAIL.REQUIRED })
  @IsEmail({}, { message: AUTH_DTO_MESSAGE.EMAIL.INVALID })
  email: string;

  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.PASSWORD.REQUIRED })
  @MinLength(6, { message: AUTH_DTO_MESSAGE.PASSWORD.MIN_LENGTH(6) })
  password: string;
}
