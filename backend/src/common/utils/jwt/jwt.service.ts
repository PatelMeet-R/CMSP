import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from 'src/common/interfaces/auth/jwt-payload.interface';
import { User } from 'src/modules/auth/domain/entities/user.entity';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  verifyRefreshToken(Token: string): RefreshTokenPayload {
    return this.jwtService.verify<{ sub: number }>(Token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
    });
  }

  generateEmailVerificationToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id },

      {
        secret: this.configService.get<string>('JWT_EMAIL_SECRET'),
        expiresIn: '10m',
      },
    );
  }

  verifyEmailToken(token) {
    return this.jwtService.verify<{ sub: number }>(token, {
      secret: this.configService.get('JWT_EMAIL_SECRET'),
    });
  }

  generateToken(user: User) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  generateAccessToken(user: User): string {
    // --> email ,sub(id),role--> RBAC

    const payload: AccessTokenPayload = {
      email: user.email,
      sub: user.id,
      role: user.role.key,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES'),
    });
  }

  generateRefreshToken(user: User): string {
    const payload: RefreshTokenPayload = {
      sub: user.id,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
    });
  }
}
