import { Injectable, NotFoundException } from '@nestjs/common';
import { EnumRepository } from '../data/repositories/repository';
import { EnumValue } from './entities/enumValue.entity';

@Injectable()
export class EnumService {
  constructor(private readonly enumRepository: EnumRepository) {}

  async getMeAllEnumValues(type: string): Promise<EnumValue[]> {
    return this.enumRepository.getMeAllEnumValues(type);
  }

  async getMeEnumValueIfExist(type: string, key: string): Promise<EnumValue> {
    const enumValue = await this.enumRepository.getMeEnumValue(key, type);

    if (!enumValue) {
      throw new NotFoundException(`Enum value not found: ${type} - ${key}`);
    }

    return enumValue;
  }
  async getEnumValueById(id: string) {
    const enumValue = await this.enumRepository.findEnumById(id);

    if (!enumValue) {
      throw new NotFoundException(`Enum value not found with ${id}`);
    }

    return enumValue;
  }
  async getEnumValueByName(name: string) {
    const enumValue = await this.enumRepository.findEnumValueByName(name);

    if (!enumValue) {
      throw new NotFoundException(`Enum value not found with ${name}`);
    }

    return enumValue;
  }
}
