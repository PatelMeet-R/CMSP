import { IsNotEmpty, IsUUID } from 'class-validator';

export class ApproveUserDto {
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
