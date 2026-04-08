import { IsOptional, IsString, IsNumber, Length } from 'class-validator';
import { PI_DTO_MESSAGE } from 'src/common/constants/dto/users-dto/personal-info.dto.message';

export class UpdatePersonalInfoDto {
  // BASIC FIELDS (Anyone can update these)

  @IsOptional()
  @IsNumber({}, { message: PI_DTO_MESSAGE.GENDER_ID.NUMBER })
  genderId?: number;

  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.PRIMARY_MOBILE_NUMBER.STRING })
  @Length(10, 10, { message: PI_DTO_MESSAGE.PRIMARY_MOBILE_NUMBER.LENGTH })
  primaryMobileNumber?: string;

  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.SECONDARY_MOBILE_NUMBER.STRING })
  @Length(10, 10, { message: PI_DTO_MESSAGE.SECONDARY_MOBILE_NUMBER.LENGTH })
  secondaryMobileNumber?: string;

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

  @IsOptional()
  @IsNumber({}, { message: PI_DTO_MESSAGE.JOINED_ACADEMIC_YEAR_ID.NUMBER })
  joinedAcademicYearId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Profile Image ID must be a number' })
  profileImageId?: number;

  // ADMIN-ONLY FIELDS

  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.FIRST_NAME.STRING })
  firstName?: string;

  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.LAST_NAME.STRING })
  lastName?: string;

  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.ENROLLMENT_NUMBER?.STRING })
  enrollmentNumber?: string;

  @IsOptional()
  @IsNumber({}, { message: PI_DTO_MESSAGE.USER_ACCOUNT_STATUS_ID.NUMBER })
  userAccountStatusId?: number;

  @IsOptional()
  @IsNumber({}, { message: PI_DTO_MESSAGE.EXPECTED_GRADUATE_YEAR_ID.NUMBER })
  expectedGraduateYearId?: number;

  @IsOptional()
  @IsNumber({}, { message: PI_DTO_MESSAGE.BRANCH_ID.NUMBER })
  branchId?: number;
}
