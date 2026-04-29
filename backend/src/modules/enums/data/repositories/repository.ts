import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EnumType } from '../../domain/entities/enumType.entity';
import { EnumValue } from '../../domain/entities/enumValue.entity';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class EnumRepository {
  constructor(
    @InjectRepository(EnumType)
    private readonly enumTypeRepo: Repository<EnumType>,
    @InjectRepository(EnumValue)
    private readonly enumValueRepo: Repository<EnumValue>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async getMeAllEnumValues(type: string) {
    const cacheKey = `enums_all_${type}`;
    const cached = await this.cacheManager.get<EnumValue[]>(cacheKey);
    if (cached) return cached;

    const data = await this.enumValueRepo.find({
      where: { type: { type: type } },
      relations: ['type'],
      order: { createdAt: 'ASC' },
    });

    await this.cacheManager.set(cacheKey, data, 86400000); // 24 hours
    return data;
  }

  async getMeEnumValue(key: string, type: string) {
    const cacheKey = `enum_val_${type}_${key}`;
    const cached = await this.cacheManager.get<EnumValue>(cacheKey);
    if (cached) return cached;

    const data = await this.enumValueRepo.findOne({
      where: { key: key, type: { type: type } },
      relations: ['type'],
    });

    if (data) await this.cacheManager.set(cacheKey, data, 86400000);
    return data;

    // Fetch a specific EnumValue by key that belongs to a given EnumType
  }
  async findEnumById(id: string) {
    const cacheKey = `enum_id_${id}`;
    const cached = await this.cacheManager.get<EnumValue>(cacheKey);
    if (cached) return cached;

    const data = await this.enumValueRepo.findOne({
      where: { id },
      relations: ['type'],
    });

    if (data) await this.cacheManager.set(cacheKey, data, 86400000);
    return data;
  }

  async findEnumValueByName(name: string) {
    const cacheKey = `enum_name_${name}`;
    const cached = await this.cacheManager.get<EnumValue>(cacheKey);
    if (cached) return cached;

    const data = await this.enumValueRepo.findOne({
      where: { value: name },
      relations: ['type'],
    });

    if (data) await this.cacheManager.set(cacheKey, data, 86400000);
    return data;
  }

  //  Get EnumType entity by its string name
  async getEnumTypeByName(typeString: string): Promise<EnumType | null> {
    return this.enumTypeRepo.findOne({ where: { type: typeString } });
  }

  //  Check for duplicates before inserting
  async checkDuplicateExists(
    key: string,
    value: string,
    typeId: string,
  ): Promise<boolean> {
    const existing = await this.enumValueRepo.findOne({
      where: [
        { key, type: { id: typeId } },
        { value, type: { id: typeId } },
      ],
    });
    return !!existing;
  }

  //  Save and invalidate cache
  async saveEnumValue(entity: EnumValue): Promise<EnumValue> {
    const saved = await this.enumValueRepo.save(entity);

    // Clear the specific type list cache and this item's cache
    if (saved.type && saved.type.type) {
      await this.cacheManager.del(`enums_all_${saved.type.type}`);
    }
    await this.cacheManager.del(`enum_id_${saved.id}`);
    await this.cacheManager.del(`enum_val_${saved.type?.type}_${saved.key}`);

    return saved;
  }
}
