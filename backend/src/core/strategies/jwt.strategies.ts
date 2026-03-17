import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { AuthService } from 'src/modules/auth/domain/services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ?? 'JWT_ACCESS_SECRET',
    });
  }

  async validate(payload: any) {
    try {
      const user = this.authService.findUserEntityById(payload.sub);
      return user;
    } catch (error) {
      throw new UnauthorizedException(ERRORMESSAGE.INVALID_TOKEN);
    }
  }
}
