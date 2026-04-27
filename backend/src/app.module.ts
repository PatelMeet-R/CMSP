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
import { AssignmentModule } from './modules/assignment/assignment.module';
import cloudinaryConfig from './config/cloudinary.config';
import { CacheModule } from '@nestjs/cache-manager';
import { SettingsModule } from 'src/core/system-setting/settings.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CacheModule.register({ isGlobal: true, ttl: 30000, max: 100 }),
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
      load: [mailConfig, appConfig, cloudinaryConfig],
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
  providers: [AppService],
})
export class AppModule {}
