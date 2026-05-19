import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EnumService } from 'src/modules/enums/domain/enums.service';
import {
  ENUM_TYPES,
  ENUM_VALUES,
} from 'src/common/constants/enum-types.constant';
import { PersonalInfoRepository } from 'src/modules/users/data/repository/personal-info-repository';
import { INACTIVITY_THRESHOLD_DAYS } from 'src/common/constants/token.constants';

@Injectable()
export class InactivityCronService {
  private readonly logger = new Logger(InactivityCronService.name);

  constructor(
    private readonly personalInfoRepo: PersonalInfoRepository,
    private readonly enumService: EnumService,
  ) {}

  //  Runs automatically every single night at Midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sweepInactiveUsers() {
    this.logger.log('Starting daily inactive user sweep...');

    // 1. Calculate the date 30 days ago
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - INACTIVITY_THRESHOLD_DAYS);

    // 2. Fetch the 'INACTIVE' enum status
    const inactiveStatus = await this.enumService.getMeEnumValueIfExist(
      ENUM_TYPES.USER_ACC_STATUS,
      ENUM_VALUES.USER_ACC_STATUS.INACTIVE,
    );

    if (!inactiveStatus) {
      this.logger.error('INACTIVE status enum is missing from the database!');
      return;
    }

    // 3. Find users who haven't logged in for 30+ days
    const dormantUsers =
      await this.personalInfoRepo.findDormantActiveUsers(thresholdDate);

    if (dormantUsers.length === 0) {
      this.logger.log('No inactive users found today.');
      return;
    }

    // 4. Suspend them
    for (const profile of dormantUsers) {
      profile.userAccountStatus = inactiveStatus;
      profile.statusFeedback =
        'Your account was automatically suspended due to 30 days of inactivity. Please use the reactivation email to restore access.';
    }

    await this.personalInfoRepo.saveMany(dormantUsers);

    // 5.  Clear their caches so the StatusGuard kicks them out instantly!
    for (const profile of dormantUsers) {
      if (profile.user?.id) {
        await this.personalInfoRepo.clearSingleUserCache(profile.user.id);
      }
    }

    this.logger.log(
      `Successfully suspended ${dormantUsers.length} dormant users.`,
    );
  }
}
