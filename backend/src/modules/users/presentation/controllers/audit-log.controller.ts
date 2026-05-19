import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuditLoggerService } from '../../domain/services/audit-logger.service';
import { Permissions } from 'src/core/decorators/permissions.decorator';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLoggerService: AuditLoggerService) {}

  @Get(':targetId')
  @HttpCode(HttpStatus.OK)
  @Permissions('user:read-logs') //     Require specific permission to view history
  async getUserAuditLogs(
    @Param('targetId') targetId: string,
    @Query('limit') limit?: number,
  ) {
    const logs = await this.auditLoggerService.getLogsForUser(
      targetId,
      limit || 50,
    );
    return {
      message: 'Audit logs retrieved successfully',
      data: logs,
    };
  }
}
