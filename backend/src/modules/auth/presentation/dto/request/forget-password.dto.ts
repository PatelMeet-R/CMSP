import { IsEmail } from "class-validator";

export class ForgetPassMailReq {
  @IsEmail({}, { message: 'Please Provide Valid email' })
  email: string;
}



