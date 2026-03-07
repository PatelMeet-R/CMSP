import { Injectable, NotFoundException } from '@nestjs/common';
import { EnumValue } from '../entities/enumValue.entity';
import { EnumRepository } from '../../data/repositories/repository';

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
}
