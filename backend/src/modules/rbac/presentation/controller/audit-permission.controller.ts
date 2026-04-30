import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { PermissionAuditService } from 'src/modules/rbac/domain/services/permission-audit.service';

@Controller('permission-audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionAuditController {
  constructor(
    private readonly permissionAuditService: PermissionAuditService,
  ) {}

  @Get('user/:targetUserId')
  @HttpCode(HttpStatus.OK)
  @Permissions('user:manage-permissions') // Re-using the matrix permission to secure the logs
  async getUserPermissionLogs(@Param('targetUserId') targetUserId: string) {
    const logs =
      await this.permissionAuditService.getPermissionLogsForUser(targetUserId);

    return {
      message: 'Permission audit logs retrieved successfully',
      data: logs,
    };
  }
}
