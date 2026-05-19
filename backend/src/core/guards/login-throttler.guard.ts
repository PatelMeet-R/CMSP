import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as throttler from '@nestjs/throttler';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import {
  NUMBER_OF_TIMES_USER_CAN_TRY_LOGIN_ATTEMPTS,
  REFRESH_LOGIN_TTL,
} from 'src/common/constants/token.constants';

@Injectable()
export class LoginThrottlerGuard extends throttler.ThrottlerGuard {
  constructor(
    options: throttler.ThrottlerModuleOptions,
    storage: throttler.ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storage, reflector);
  }
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const email = req.body?.email || 'anonymous';
    return `login=${email}`;
  }
  //   set limit to 3 attempts
  protected getLimit(): Promise<number> {
    return Promise.resolve(NUMBER_OF_TIMES_USER_CAN_TRY_LOGIN_ATTEMPTS || 3);
  }
  //time window time
  protected getTtl(): Promise<number> {
    return Promise.resolve(REFRESH_LOGIN_TTL || 200000);
  }
  protected async throwThrottlingException(): Promise<void> {
    throw new throttler.ThrottlerException(ERRORMESSAGE.MANY_ATTEMPTS(1));
  }
}
