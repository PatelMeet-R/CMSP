import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as throttler from '@nestjs/throttler';
import { ERRORMESSAGE } from 'src/common/constants/error.message';

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
  //   set limit to 5 attemps
  protected getLimit(): Promise<number> {
    return Promise.resolve(5);
  }
  //time window time of 1 minute
  protected getTtl(): Promise<number> {
    return Promise.resolve(60000);
  }
  protected async throwThrottlingException(): Promise<void> {
    throw new throttler.ThrottlerException(ERRORMESSAGE.MANY_ATTEMPTS(1));
  }
}
