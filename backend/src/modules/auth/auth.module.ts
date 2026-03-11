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
import { UserRepository } from './data/repository';
import { AppConfigService } from './data/services/app-config.service';
import { Branch } from '../branch/domain/entities/branch.entity';

@Module({
  imports: [
    ConfigModule,
    MailModule,
    EnumsModule,
    CommonModule,
    PassportModule,
    TypeOrmModule.forFeature([User, Branch]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    UserRepository,
    AppConfigService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
