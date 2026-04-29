import { Controller, Get, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import  { RoleService } from 'src/modules/rbac/domain/services/role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // Any admin who can create/manage users needs to see the roles list
  @Permissions('user:create', 'user:manage-role')
  @Get()
  async getAllRoles() {
    const roles = await this.roleService.findAll();
    return {
      message: 'Roles fetched successfully',
      data: roles,
    };
  }
}
