import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { AuthService } from 'src/modules/auth/domain/services/auth.service';
import { PermissionComputeService } from 'src/modules/rbac/domain/services/permission-compute.service';
import { AccessTokenPayload } from 'src/common/interfaces/auth/jwt-payload.interface';
import express from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private readonly permissionComputeService: PermissionComputeService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: express.Request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ?? 'JWT_ACCESS_SECRET',
    });
  }

  async validate(payload: AccessTokenPayload) {
    try {
      const permissionsSet =
        await this.permissionComputeService.getEffectivePermissions(
          payload.sub,
        );

      // 2. Return a flat object that matches UserResponseDto.
      // This object becomes `request.user` for all your Guards and Controllers!
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        branchId: payload.branchId,
        status: payload.status,
        permissions: Array.from(permissionsSet), // Convert Set to Array
      };

      // const user = await this.authService.findUserEntityById(payload.sub);
      // return user;
    } catch (error) {
      throw new UnauthorizedException(ERRORMESSAGE.INVALID_TOKEN);
    }
  }
}
