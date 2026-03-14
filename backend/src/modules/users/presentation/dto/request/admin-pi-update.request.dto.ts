import { IsOptional, IsString, IsNumber } from 'class-validator';
import { PI_DTO_MESSAGE } from 'src/common/constants/dto/users-dto/personal-info.dto.message';

export class AdminUpdatePersonalInfoDto {
  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.FIRST_NAME.STRING })
  firstName?: string;

  @IsOptional()
  @IsString({ message: PI_DTO_MESSAGE.LAST_NAME.STRING })
  lastName?: string;

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
