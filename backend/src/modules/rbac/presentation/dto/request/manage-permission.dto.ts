// src/modules/rbac/presentation/dto/request/manage-permission.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionOverrideState } from 'src/common/constants/permission.constant';
export class PermissionOverrideItemDto {
  @IsString()
  @IsNotEmpty()
  permissionSlug: string;

  //   TS Enum instead of  strings
  @IsEnum(PermissionOverrideState)
  @IsNotEmpty()
  state: PermissionOverrideState;
}

export class BulkManagePermissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionOverrideItemDto)
  overrides: PermissionOverrideItemDto[];

  @IsString()
  @IsNotEmpty({
    message: 'You must provide a reason for changing permissions.',
  })
  reason: string;
}
