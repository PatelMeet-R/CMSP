// src/modules/users/domain/services/audit-logger.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from '../../data/repository/audit-log.repository';

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);

  constructor(private readonly auditLogRepo: AuditLogRepository) {}

  //  Fire-and-forget logging method
  async logAction(
    actorId: string,
    action: string,
    targetId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
  ): Promise<void> {
    try {
      this.auditLogRepo
        .createLog({
          actorId,
          action,
          targetId,
          details,
          ipAddress,
        })
        .catch((err) => {
          this.logger.error(
            `Failed to save audit log: ${err.message}`,
            err.stack,
          );
        });
    } catch (error: any) {
      this.logger.error(`Error creating audit log: ${error.message}`);
    }
  }

  async getLogsForUser(targetId: string, limit: number = 50) {
    return await this.auditLogRepo.findLogsByTargetId(targetId, limit);
  }
}
