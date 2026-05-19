import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { DashboardService } from 'src/modules/dashboard/domain/service/dashboard.service';
import { DashboardController } from 'src/modules/dashboard/presentation/controller/dashboard.controller';
import { Role } from 'src/modules/rbac/domain/entities/role.entity';
import { ProfessorSubMapping } from 'src/modules/subject/domain/entities/professors-subject.entity';
import { AuditLog } from 'src/modules/users/domain/entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, ProfessorSubMapping, AuditLog]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
