import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'password is required! Please provide password' })
  @MinLength(6, { message: 'Password Must be at least 6 character long' })
  password: string;
  @IsNotEmpty()
  confirmPassword: string;
}
