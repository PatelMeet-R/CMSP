import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ENUM_VALUES } from 'src/common/constants/enum-types.constant';
import { ALLOW_INACTIVE_KEY } from 'src/core/decorators/allow-inactive.decorator';
import { IS_PUBLIC_KEY } from 'src/core/decorators/public.decorator';

@Injectable()
export class StatusGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    //  Check if public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return true;

    const currentStatus = user.status;
    //  ALWAYS block suspended/rejected users, no matter what.
    if (
      currentStatus === ENUM_VALUES.USER_ACC_STATUS.BLOCKED ||
      currentStatus === ENUM_VALUES.USER_ACC_STATUS.REJECTED
    ) {
      throw new ForbiddenException(
        'Your account has been suspended or rejected. Please contact the administration.',
      );
    }

    //  Handle Inactive Users

    if (currentStatus === ENUM_VALUES.USER_ACC_STATUS.INACTIVE) {
      const allowInactive = this.reflector.getAllAndOverride<boolean>(
        ALLOW_INACTIVE_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (allowInactive) {
        return true;
      }
      throw new ForbiddenException(
        'ACCOUNT_INACTIVE: Your account has been marked as inactive due to prolonged absence.',
      );
    }

    return true;
  }
}
