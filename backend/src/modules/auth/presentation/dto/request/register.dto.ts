import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please Provide Valid email' })
  email: string;

  @IsNotEmpty({ message: 'Name is required! Please provide name' })
  @IsString({ message: 'Name Must be String ' })
  @MinLength(3, { message: 'Name Must be at least 3 character long' })
  @MaxLength(50, { message: 'Name can not be longer than 50 characters' })
  name: string;

  @IsNotEmpty({ message: 'password is required! Please provide password' })
  @MinLength(6, { message: 'Password Must be at least 6 character long' })
  password: string;
}
