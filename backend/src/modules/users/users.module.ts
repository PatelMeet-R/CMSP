import { EnumValue } from '../enums/domain/entities/enumValue.entity';
import { User } from '../auth/domain/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalInfo } from './domain/entities/personal-info.entity';
import { PersonalInfoRepository } from './data/repository/personal-info-repository';
import { PersonalInfoService } from './domain/services/personal-info.service';
import { EnumsModule } from '../enums/enums.module';
import { AuthModule } from '../auth/auth.module';
import { BranchModule } from '../branch/branch.module';
import { EmailVerifiedGuard } from 'src/core/guards/email-verified.guard';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { PersonalInfoController } from './presentation/controllers/users.controller';

@Module({
  imports: [
    BranchModule,
    AuthModule,
    EnumsModule,
    TypeOrmModule.forFeature([EnumValue, User, PersonalInfo]),
  ],
  controllers: [PersonalInfoController],
  providers: [
    PersonalInfoRepository,
    PersonalInfoService,
    JwtAuthGuard,
    RolesGuard,
    EmailVerifiedGuard,
  ],
  exports: [],
})
export class UsersModule {}
