import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangeUserRoleDto {
  @IsInt()
  @IsNotEmpty()
  newRoleId: string;
}

export class ToggleStatusDto {
  @IsString()
  @IsNotEmpty()
  statusId: string;
  
  @IsString()
  @IsOptional()
  feedback?: string;
}
