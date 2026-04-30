import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from 'src/modules/users/domain/entities/audit-log.entity';
import { AUDIT_ACTIONS } from 'src/common/constants/permission.constant';

@Injectable()
export class PermissionAuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async getPermissionLogsForUser(targetUserId: string) {
    return this.auditLogRepo.find({
      where: {
        targetId: targetUserId,
        action: AUDIT_ACTIONS.BULK_UPDATE_PERMISSIONS, // Only fetch permission changes
      },
      // Join the admin user who made the change to display their name
      relations: ['user', 'user.personalInfo'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        action: true,
        createdAt: true,
        details: true, // Contains { reason, updates }
        user: {
          id: true,
          email: true,
          personalInfo: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
