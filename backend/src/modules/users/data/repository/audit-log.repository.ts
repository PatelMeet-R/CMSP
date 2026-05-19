import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../domain/entities/audit-log.entity';

@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async createLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.repo.create(data);
    return await this.repo.save(log);
  }

  async findLogsByTargetId(
    targetId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.repo.find({
      where: { targetId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
