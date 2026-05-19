import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from 'src/modules/users/domain/entities/audit-log.entity';
import { AUDIT_ACTIONS } from 'src/common/constants/permission.constant';
import { PersonalInfoRepository } from 'src/modules/users/data/repository/personal-info-repository';

@Injectable()
export class PermissionAuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
    private readonly personalInfoRepo: PersonalInfoRepository,
  ) {}

  async getPermissionLogsForUser(personalInfoId: string) {
    // 1. Resolve Auth User ID from Personal Info ID
    const profile = await this.personalInfoRepo.findPersonalInfoById(
      personalInfoId,
    );
    if (!profile || !profile.user) return [];

    const authUserId = profile.user.id;

    return this.auditLogRepo.find({
      where: {
        targetId: authUserId,
        action: AUDIT_ACTIONS.BULK_UPDATE_PERMISSIONS, // Only fetch permission changes
      },
      // Join the admin user who made the change to display their name
      relations: ['actor', 'actor.personalInfo'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        action: true,
        createdAt: true,
        details: true, // Contains { reason, updates }
        actor: {
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
