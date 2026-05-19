import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

export class FindUsersPersonalInfoQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "enrollment number can't exceed 100 characters" })
  search?: string;

  // ====== FILTER  ======
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  genderId?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsString()
  statusKey: string;
}
