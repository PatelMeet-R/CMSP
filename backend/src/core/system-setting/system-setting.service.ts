import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SystemSetting } from 'src/core/system-setting/system-setting.entity';
import { UpsertSettingDto } from 'src/core/system-setting/system-setting.dto';

@Injectable()
export class SystemSettingService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingRepo: Repository<SystemSetting>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  //   ============================

  // Get a specific setting by its key (Highly Cached)
  async getSettingValue(key: string): Promise<string | null> {
    const cacheKey = `setting_${key}`;
    const cachedValue = await this.cacheManager.get<string>(cacheKey);

    if (cachedValue) return cachedValue;

    const setting = await this.settingRepo.findOne({ where: { key } });
    if (!setting) return null;

    // Cache the value for 1 hour (3600000 ms)
    await this.cacheManager.set(cacheKey, setting.value, 3600000);
    return setting.value;
  }
  //   ============================

  // Create or Update a setting
  async upsertSetting(dto: UpsertSettingDto) {
    let setting = await this.settingRepo.findOne({ where: { key: dto.key } });

    if (!setting) {
      setting = this.settingRepo.create({ key: dto.key });
    }

    setting.value = dto.value;
    if (dto.description) setting.description = dto.description;

    const saved = await this.settingRepo.save(setting);

    // Clear the cache for this specific key so the next read gets the fresh value
    await this.cacheManager.del(`setting_${dto.key}`);

    return saved;
  }
  //   ============================

  async getCurrentAcademicYearId(): Promise<number> {
    const val = await this.getSettingValue('CURRENT_ACADEMIC_YEAR_ID');
    if (!val) {
      throw new NotFoundException(
        'Current Academic Year has not been set by the Admin.',
      );
    }
    return parseInt(val, 10);
  }
  //   ============================
}
