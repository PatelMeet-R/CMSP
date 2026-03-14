import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Length,
} from 'class-validator';
import { PI_DTO_MESSAGE } from 'src/common/constants/dto/users-dto/personal-info.dto.message';

export class CreatePersonalInfoDto {
  @IsNotEmpty({ message: PI_DTO_MESSAGE.FIRST_NAME.REQUIRED })
  @IsString({ message: PI_DTO_MESSAGE.FIRST_NAME.STRING })
  firstName: string;

  @IsNotEmpty({ message: PI_DTO_MESSAGE.LAST_NAME.REQUIRED })
  @IsString({ message: PI_DTO_MESSAGE.LAST_NAME.STRING })
  lastName: string;

  @IsNotEmpty({ message: PI_DTO_MESSAGE.GENDER_ID.REQUIRED })
  @IsNumber({}, { message: PI_DTO_MESSAGE.GENDER_ID.NUMBER })
  genderId: number;

  @IsNotEmpty({ message: PI_DTO_MESSAGE.BRANCH_ID.REQUIRED })
  @IsNumber({}, { message: PI_DTO_MESSAGE.BRANCH_ID.NUMBER })
  branchId: number;

  //year
  @IsNotEmpty({
    message: PI_DTO_MESSAGE.JOINED_ACADEMIC_YEAR_ID.REQUIRED,
  })
  @IsNumber({}, { message: PI_DTO_MESSAGE.JOINED_ACADEMIC_YEAR_ID.NUMBER })
  joinedAcademicYearId: number;

  @IsNotEmpty({
    message: PI_DTO_MESSAGE.EXPECTED_GRADUATE_YEAR_ID.REQUIRED,
  })
  @IsNumber({}, { message: PI_DTO_MESSAGE.EXPECTED_GRADUATE_YEAR_ID.NUMBER })
  expectedGraduateYearId: number;

  //mobile number
  @IsNotEmpty({
    message: PI_DTO_MESSAGE.PRIMARY_MOBILE_NUMBER.REQUIRED,
  })
  @IsString({ message: PI_DTO_MESSAGE.PRIMARY_MOBILE_NUMBER.STRING })
  @Length(10, 10, {
    message: PI_DTO_MESSAGE.PRIMARY_MOBILE_NUMBER.LENGTH,
  })
  primaryMobileNumber: string;

  @IsOptional()
  @IsString({
    message: PI_DTO_MESSAGE.SECONDARY_MOBILE_NUMBER.STRING,
  })
  @Length(10, 10, {
    message: PI_DTO_MESSAGE.SECONDARY_MOBILE_NUMBER.LENGTH,
  })
  secondaryMobileNumber?: string;

  //address
  @IsNotEmpty({ message: PI_DTO_MESSAGE.CITY.REQUIRED })
  @IsString({ message: PI_DTO_MESSAGE.CITY.STRING })
  city: string;

  @IsNotEmpty({ message: PI_DTO_MESSAGE.STATE.REQUIRED })
  @IsString({ message: PI_DTO_MESSAGE.STATE.STRING })
  state: string;

  @IsNotEmpty({ message: PI_DTO_MESSAGE.COUNTRY.REQUIRED })
  @IsString({ message: PI_DTO_MESSAGE.COUNTRY.STRING })
  country: string;

  @IsNotEmpty({ message: PI_DTO_MESSAGE.POSTAL_CODE.REQUIRED })
  @IsString({ message: PI_DTO_MESSAGE.POSTAL_CODE.STRING })
  @Length(6, 6, { message: PI_DTO_MESSAGE.POSTAL_CODE.LENGTH })
  postalCode: string;
  @IsNotEmpty()
  @IsString()
  enrollmentNumber: string;
}
