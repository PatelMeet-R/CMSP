import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnumRepository } from '../data/repositories/repository';
import { EnumValue } from './entities/enumValue.entity';
import type { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

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

  async createEnumValue(
    typeString: string,
    dto: { key: string; value: string },
    currentUser: UserResponseDto,
  ) {
    const enumType = await this.enumRepository.getEnumTypeByName(typeString);
    if (!enumType)
      throw new NotFoundException(
        `Enum category '${typeString}' does not exist.`,
      );

    const isDuplicate = await this.enumRepository.checkDuplicateExists(
      dto.key,
      dto.value,
      enumType.id,
    );
    if (isDuplicate)
      throw new ConflictException(
        `An enum with this key or value already exists in this category.`,
      );

    const newEnum = new EnumValue();
    newEnum.key = dto.key.toUpperCase().replace(/\s+/g, '_'); // Enforce standard key formatting
    newEnum.value = dto.value;
    newEnum.type = enumType;
    newEnum.createdBy = currentUser.id;

    return this.enumRepository.saveEnumValue(newEnum);
  }

  async updateEnumValue(
    id: string,
    dto: { key?: string; value?: string },
    currentUser: UserResponseDto,
  ) {
    const existingEnum = await this.enumRepository.findEnumById(id);
    if (!existingEnum) throw new NotFoundException(`Enum value not found.`);

    if (dto.key) existingEnum.key = dto.key.toUpperCase().replace(/\s+/g, '_');
    if (dto.value) existingEnum.value = dto.value;
    existingEnum.updatedBy = currentUser.id;

    return this.enumRepository.saveEnumValue(existingEnum);
  }
}
