import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './domain/services/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from 'src/modules/mail/mail.module';
import { AuthController } from './presentation/controller/auth.controller';
import { JwtStrategy } from 'src/core/strategies/jwt.strategies';
import { CommonModule } from 'src/common/common.module';
import { EnumsModule } from '../enums/enums.module';
import { AuthRepository } from './data/repository';
import { PersonalInfo } from '../users/domain/entities/personal-info.entity';
import { BranchModule } from '../branch/branch.module';
import { Branch } from '../branch/domain/entities/branch.entity';
import { LoginThrottlerGuard } from 'src/core/guards/login-throttler.guard';
import { Reflector } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from 'src/modules/users/users.module';
import { RbacModule } from '../rbac/rbac.module';
import { CoreModule } from 'src/core/core.module';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule,
    MailModule,
    EnumsModule,
    CommonModule,
    BranchModule,
    PassportModule,
    ThrottlerModule,

    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([User, PersonalInfo, Branch]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    Reflector,

    AuthRepository,
    {
      provide: 'APP_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get('app');
      },
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
