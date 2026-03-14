import { IsEmail, IsNotEmpty } from 'class-validator';
import { AUTH_DTO_MESSAGE } from 'src/common/constants/dto/auth.dto.message';

export class ForgetPassMailReq {
  @IsNotEmpty({ message: AUTH_DTO_MESSAGE.EMAIL.REQUIRED })
  @IsEmail({}, { message: AUTH_DTO_MESSAGE.EMAIL.INVALID })
  email: string;
}
