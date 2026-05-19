import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { RoleService } from 'src/modules/rbac/domain/services/role.service';
import { UpdateRolePermissionsDto } from 'src/modules/rbac/presentation/dto/request/update-role-permission,dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // Any admin who can create/manage users needs to see the roles list
  // @Permissions('user:create', 'user:manage-role')
  @Permissions(
    'user:create',
    'user:manage-role',
    'user:read',
    'staff:read',
    'student:read',
    'role:read',
  )
  @Get()
  async getAllRoles() {
    const roles = await this.roleService.findAll();
    return {
      message: 'Roles fetched successfully',
      data: roles,
    };
  }

  // ================================
  @Permissions('user:manage-global') // Only super admins should alter base roles
  @Get(':id/permissions')
  async getRolePermissions(@Param('id') roleId: string) {
    const data = await this.roleService.getRolePermissionMatrix(roleId);
    return {
      message: 'Role permissions fetched successfully',
      data,
    };
  }

  @Permissions('user:manage-global')
  @Put(':id/permissions')
  @HttpCode(HttpStatus.OK)
  async updateRolePermissions(
    @Param('id') roleId: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    const result = await this.roleService.updateRolePermissions(
      roleId,
      dto.permissionSlugs,
    );
    return {
      message: result.message,
    };
  }
}
