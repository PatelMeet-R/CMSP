import {
  IsOptional,
  IsString,
  IsNumber,
  Length,
  IsNotEmpty,
} from 'class-validator';
import { PI_DTO_MESSAGE } from 'src/common/constants/dto/users-dto/personal-info.dto.message';

export class UpdateByUserPersonalInfoDto {
  @IsOptional()
  @IsNumber({}, { message: PI_DTO_MESSAGE.GENDER_ID.NUMBER })
  genderId?: number;

  // mobile number
  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.PRIMARY_MOBILE_NUMBER.STRING })
  @Length(10, 10, {
    message: PI_DTO_MESSAGE.PRIMARY_MOBILE_NUMBER.LENGTH,
  })
  primaryMobileNumber?: string;

  @IsOptional()
  @IsString({
    message: PI_DTO_MESSAGE.SECONDARY_MOBILE_NUMBER.STRING,
  })
  @Length(10, 10, {
    message: PI_DTO_MESSAGE.SECONDARY_MOBILE_NUMBER.LENGTH,
  })
  secondaryMobileNumber?: string;

  // address
  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.CITY.STRING })
  city?: string;

  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.STATE.STRING })
  state?: string;

  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.COUNTRY.STRING })
  country?: string;

  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.POSTAL_CODE.STRING })
  @Length(6, 6, { message: PI_DTO_MESSAGE.POSTAL_CODE.LENGTH })
  postalCode?: string;

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
}
