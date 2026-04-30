import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { BranchModule } from './modules/branch/branch.module';
import { SubjectModule } from './modules/subject/subject.module';
import { EnumsModule } from './modules/enums/enums.module';
import { UsersModule } from './modules/users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import mailConfig from './config/mail.config';
import appConfig from './config/app.config';
import redisConfig from './config/redis.config';
import { AssignmentModule } from './modules/assignment/assignment.module';
import cloudinaryConfig from './config/cloudinary.config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { SettingsModule } from 'src/core/system-setting/settings.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StatusGuard } from 'src/core/guards/status.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { DashboardModule } from 'src/modules/dashboard/dashboard.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port'),
          },
          password: configService.get<string>('redis.password'),
        }),
        ttl: configService.get<number>('redis.ttl'), // milliseconds
      }),
    }),
    DashboardModule,
    AuthModule,
    RbacModule,
    BranchModule,
    EnumsModule,
    SubjectModule,
    UsersModule,
    AssignmentModule,
    SettingsModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mailConfig, appConfig, cloudinaryConfig, redisConfig],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 5,
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),

        // ssl: {
        //   rejectUnauthorized: false,
        // },
        ssl: false,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 1. Identify the user
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 2. Check if they are banned
    {
      provide: APP_GUARD,
      useClass: StatusGuard,
    },
    // 3. Check what they are allowed to do
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
