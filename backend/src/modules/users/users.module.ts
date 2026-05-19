import { EnumValue } from '../enums/domain/entities/enumValue.entity';
import { User } from '../auth/domain/entities/user.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalInfo } from './domain/entities/personal-info.entity';
import { PersonalInfoRepository } from './data/repository/personal-info-repository';
import { PersonalInfoService } from './domain/services/personal-info.service';
import { EnumsModule } from '../enums/enums.module';
import { BranchModule } from '../branch/branch.module';
import { PersonalInfoController } from './presentation/controllers/users.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { FileUploadModule } from 'src/modules/file-upload/file-upload.module';
import { StaffProfileService } from 'src/modules/users/domain/services/staff-profile.service';
import { StaffProfileRepository } from 'src/modules/users/data/repository/staff-profile.repository';
import { StaffProfileController } from 'src/modules/users/presentation/controllers/staff-profile.controller';
import { StaffProfile } from 'src/modules/users/domain/entities/staff-profile.entity';
import { AuditLoggerService } from 'src/modules/users/domain/services/audit-logger.service';
import { AuditLogRepository } from 'src/modules/users/data/repository/audit-log.repository';
import { AuditLog } from 'src/modules/users/domain/entities/audit-log.entity';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    BranchModule,
    EnumsModule,
    FileUploadModule,
    TypeOrmModule.forFeature([
      EnumValue,
      User,
      StaffProfile,
      PersonalInfo,
      AuditLog,
    ]),
  ],
  controllers: [PersonalInfoController, StaffProfileController],
  providers: [
    AuditLoggerService,
    AuditLogRepository,
    PersonalInfoService,
    PersonalInfoRepository,
    StaffProfileService,
    StaffProfileRepository,
  ],
  exports: [PersonalInfoRepository, StaffProfileService, AuditLoggerService],
})
export class UsersModule {}
