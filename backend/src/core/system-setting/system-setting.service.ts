import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SystemSetting } from 'src/core/system-setting/system-setting.entity';
import { UpsertSettingDto } from 'src/core/system-setting/system-setting.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

@Injectable()
export class SystemSettingService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly repo: Repository<SystemSetting>,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  //   ============================

  async getSettingValue(key: string): Promise<string | null> {
    const setting = await this.repo.findOne({ where: { key } });
    return setting ? setting.value : null;
  }
  //   ============================

  async upsertSetting(dto: UpsertSettingDto, currentUser: UserResponseDto) {
    // 1. Fetch the existing setting to see what the OLD value was
    let setting = await this.repo.findOne({ where: { key: dto.key } });
    const oldValue = setting?.value;

    if (!setting) {
      setting = this.repo.create({ key: dto.key });
      setting.createdBy = currentUser.id;
    }

    setting.value = dto.value;
    setting.description = dto.description || setting.description;
    setting.updatedBy = currentUser.id;

    // 2. Save the setting to the database
    const savedSetting = await this.repo.save(setting);

    // 3.  THE EVENT TRIGGER
    // If they updated the Academic Year, AND it is different from the old one
    if (
      dto.key === 'CURRENT_ACADEMIC_YEAR_ID' &&
      oldValue &&
      oldValue !== dto.value
    ) {
      console.log(
        `[System] Triggering Academic Year rollover from ${oldValue} to ${dto.value}`,
      );

      this.eventEmitter.emit('academic-year.changed', {
        oldYearId: oldValue,
        newYearId: dto.value,
        triggeredByUserId: currentUser.id,
      });
    }

    return savedSetting;
  }
  //   ============================

  async getCurrentAcademicYearId(): Promise<string> {
    const val = await this.getSettingValue('CURRENT_ACADEMIC_YEAR_ID');
    if (!val) {
      throw new NotFoundException(
        'Current Academic Year has not been set by the Admin.',
      );
    }
    return val;
  }
  //   ============================
}
