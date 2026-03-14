import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EnumType } from '../../domain/entities/enumType.entity';
import { EnumValue } from '../../domain/entities/enumValue.entity';

@Injectable()
export class EnumRepository {
  constructor(
    @InjectRepository(EnumType)
    private readonly enumTypeRepo: Repository<EnumType>,
    @InjectRepository(EnumValue)
    private readonly enumValueRepo: Repository<EnumValue>,
  ) {}
  async getMeAllEnumValues(type: string) {
    return this.enumValueRepo.find({
      where: { type: { type: type } },
      relations: ['type'],
    });
  }
  async getMeEnumValue(key: string, type: string) {
    return this.enumValueRepo.findOne({
      where: {
        key: key,
        type: { type: type },
      },
      relations: ['type'],
    });

    // Fetch a specific EnumValue by key that belongs to a given EnumType
  }
  async findEnumById(id: number) {
    return this.enumValueRepo.findOne({
      where: { id },
      relations: ['type'],
    });
  }
  async findEnumValueByName(name: string) {
    return this.enumValueRepo.findOne({
      where: { value: name },
      relations: ['type'],
    });
  }
}
