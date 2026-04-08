import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ChangeUserRoleDto {
  @IsInt()
  @IsNotEmpty()
  newRoleId: number;
}

export class ToggleStatusDto {
  @IsString()
  @IsNotEmpty()
  statusKey: string;
}
