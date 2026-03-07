import { Module } from '@nestjs/common';
import { CryptoService } from './utils/crypto/crypto.service';
import { BcyptService } from './utils/bcypt/bcypt.service';
import { JwtTokenService } from './utils/jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'JWT_SECRET',

        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES')!,
        },
      }),
    }),
  ],
  providers: [JwtTokenService, BcyptService, CryptoService],
  exports: [JwtTokenService, BcyptService, CryptoService],
})
export class CommonModule {}
