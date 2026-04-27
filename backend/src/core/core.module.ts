import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { LoginThrottlerGuard } from 'src/core/guards/login-throttler.guard';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [JwtAuthGuard, LoginThrottlerGuard, PermissionsGuard],
  exports: [JwtAuthGuard, LoginThrottlerGuard, PermissionsGuard],
})
export class CoreModule {}
