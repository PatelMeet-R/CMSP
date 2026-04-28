import { Injectable } from '@nestjs/common';
import * as throttler from '@nestjs/throttler';
import { SUCCESSMSG } from 'src/common/constants/success.message';

@Injectable()
export class VerificationEmailThrottlerGuard extends throttler.ThrottlerGuard {
//   constructor(
//     options: throttler.ThrottlerModuleOptions,
//     storage: throttler.ThrottlerStorage,
//     reflector: Reflector,
//   ) {
//     super(options, storage, reflector);
//   }
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userId = req.user?.id || req.user?.sub || 'anonymous';
    return 'verify-email:${userId}';
  }
  protected getLimit(): Promise<number> {
    return Promise.resolve(1);
  }
  protected async throwThrottlingException(): Promise<void> {
    throw new throttler.ThrottlerException(
      SUCCESSMSG.AUTH.VERIFICATION_THROTTLE_MSG,
    );
  }
}
