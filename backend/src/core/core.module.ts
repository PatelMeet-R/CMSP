import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { LoginThrottlerGuard } from 'src/core/guards/login-throttler.guard';
import { StatusGuard } from 'src/core/guards/status.guard';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [JwtAuthGuard, LoginThrottlerGuard, PermissionsGuard, StatusGuard],
  exports: [JwtAuthGuard, LoginThrottlerGuard, StatusGuard, PermissionsGuard],
})
export class CoreModule {}
