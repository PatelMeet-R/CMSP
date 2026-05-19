import { IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

export class FindAssignmentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "enrollment number can't exceed 100 characters" })
  private _search?: string | undefined;
  public get search(): string | undefined {
    return this._search;
  }
  public set search(value: string | undefined) {
    this._search = value;
  }

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  academicYearId?: number;
}
