import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

export class FindUsersPersonalInfoQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "enrollment number can't exceed 100 characters" })
  search?: string;

  // ====== FILTER  ======
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  genderId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roleId?: number;
}
