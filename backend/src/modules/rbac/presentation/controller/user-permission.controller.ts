import {
  Controller,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { UserPermissionService } from 'src/modules/rbac/domain/services/user-permission.service';
import { BulkManagePermissionDto } from 'src/modules/rbac/presentation/dto/request/manage-permission.dto';

@Controller('user-permissions')
export class UserPermissionController {
  constructor(private readonly userPermissionService: UserPermissionService) {}

  @Put('bulk/:personalInfoId')
  @HttpCode(HttpStatus.OK)
  @Permissions('user:manage-permissions')
  async bulkUpdateOverrides(
    @Param('personalInfoId') personalInfoId: string,
    @Body() dto: BulkManagePermissionDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    const res = await this.userPermissionService.bulkSetPermissions(
      personalInfoId,
      dto,
      currentUser,
    );
    return { message: res.message };
  }

  @Get('matrix/:personalInfoId')
  @HttpCode(HttpStatus.OK)
  @Permissions('user:manage-permissions')
  async getPermissionMatrix(
    @Param('personalInfoId') personalInfoId: string,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    const data = await this.userPermissionService.getPermissionMatrix(
      personalInfoId,
      currentUser,
    );
    return {
      message: 'Permission matrix retrieved successfully',
      data,
    };
  }
}
