import { Module } from '@nestjs/common';
import { AuthService } from './domain/services/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { MailModule } from 'src/modules/mail/mail.module';
import { AuthController } from './presentation/controller/auth.controller';
import { JwtStrategy } from 'src/core/strategies/jwt.strategies';
import { CommonModule } from 'src/common/common.module';
import { EnumsModule } from '../enums/enums.module';
import { AuthRepository } from './data/repository';
import { AppConfigService } from './data/services/app-config.service';
import { PersonalInfo } from '../users/domain/entities/personal-info.entity';
import { BranchModule } from '../branch/branch.module';
import { Branch } from '../branch/domain/entities/branch.entity';
import { Reflector } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule,
    MailModule,
    EnumsModule,
    CommonModule,
    BranchModule,
    PassportModule,
    ThrottlerModule,
    TypeOrmModule.forFeature([User, PersonalInfo, Branch]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    Reflector,
    AuthRepository,
    AppConfigService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
