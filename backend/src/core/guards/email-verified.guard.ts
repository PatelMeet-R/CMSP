import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const { user } = ctx.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException(ERRORMESSAGE.USER_NOT_AUTHENTICATED);
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException(ERRORMESSAGE.EMAIL_VERIFY_NEEDED);
    }

    return true;
  }
}
