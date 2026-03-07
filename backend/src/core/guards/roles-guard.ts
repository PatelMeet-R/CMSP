import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorators';
import { ERRORMESSAGE } from 'src/common/constants/error.message';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    // retrive the roles metadata serve by the roles decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [
        context.getHandler(), //method level metadata
        context.getClass(), //class level metadata
      ],
    );
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) {
      throw new ForbiddenException(ERRORMESSAGE.USER_NOT_AUTHENTICATED);
    }
    const userRoleKey = user.role?.key;
    const hasRequiredRole = requiredRoles.includes(userRoleKey);

    if (!hasRequiredRole) {
      throw new ForbiddenException(ERRORMESSAGE.INSUFFICIENT_PERMISSION);
    }
    return true;
  }
}
