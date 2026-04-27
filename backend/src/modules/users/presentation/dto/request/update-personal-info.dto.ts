import {
  IsOptional,
  IsString,
  IsNumber,
  Length,
  IsUUID,
} from 'class-validator';
import { PI_DTO_MESSAGE } from 'src/common/constants/dto/users-dto/personal-info.dto.message';

export class UpdatePersonalInfoDto {
  // BASIC FIELDS (Anyone can update these)

  @IsOptional()
  @IsUUID(4, { message: 'Gender ID must be a valid UUID' })
  genderId?: string;

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
  @IsUUID(4, { message: 'joinedAcademicYearId ID must be a valid UUID' })
  joinedAcademicYearId?: string;

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
  @IsUUID(4, { message: 'userAccountStatusId ID must be a valid UUID' })
  userAccountStatusId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'expectedGraduateYearId ID must be a valid UUID' })
  expectedGraduateYearId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'branchId ID must be a valid UUID' })
  branchId?: string;
}
