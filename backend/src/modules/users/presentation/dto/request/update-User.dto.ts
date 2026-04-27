import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ChangeUserRoleDto {
  @IsInt()
  @IsNotEmpty()
  newRoleId: string;
}

export class ToggleStatusDto {
  @IsString()
  @IsNotEmpty()
  statusKey: string;
}
