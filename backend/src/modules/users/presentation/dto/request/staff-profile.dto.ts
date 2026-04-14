import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';

export class UpsertStaffProfileDto {
  @IsString()
  @IsOptional()
  designation?: string;

  @IsString()
  @IsOptional()
  officeLocation?: string;

  @IsDateString()
  @IsOptional()
  joiningDate?: string;

  @IsInt()
  @Max(10)
  @IsOptional()
  maxSubjectWorkload?: number;
}
