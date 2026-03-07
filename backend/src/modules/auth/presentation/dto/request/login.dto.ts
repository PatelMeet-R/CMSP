import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: 'Please Provide Valid email' })
  email: string;

  @IsNotEmpty({ message: 'password is required! Please provide password' })
  @MinLength(6, { message: 'Password Must be at least 6 character long' })
  password: string;
}