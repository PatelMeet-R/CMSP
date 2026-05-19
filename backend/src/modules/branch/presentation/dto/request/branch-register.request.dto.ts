import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { BRANCH_DTO_MESSAGE } from 'src/common/constants/dto/branch.dto.message';

export class BranchRegisterDto {
  @IsNotEmpty({ message: BRANCH_DTO_MESSAGE.CODE.REQUIRED })
  @IsString({ message: BRANCH_DTO_MESSAGE.CODE.STRING })
  @MinLength(2, { message: BRANCH_DTO_MESSAGE.CODE.MIN(2) })
  @MaxLength(10, { message: BRANCH_DTO_MESSAGE.CODE.MAX(10) })
  code: string;

  @IsNotEmpty({ message: BRANCH_DTO_MESSAGE.NAME.REQUIRED })
  @IsString({ message: BRANCH_DTO_MESSAGE.NAME.STRING })
  @MinLength(3, { message: BRANCH_DTO_MESSAGE.NAME.MIN(3) })
  @MaxLength(25, { message: BRANCH_DTO_MESSAGE.NAME.MAX(25) })
  name: string;
}
