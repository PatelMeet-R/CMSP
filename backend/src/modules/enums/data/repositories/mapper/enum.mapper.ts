import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { EnumResponseDto } from 'src/modules/enums/presentation/dto/enum.response.dto';

export class EnumMapper {
  static toResponse(entity: EnumValue): EnumResponseDto {
    return {
      key: entity.key,
      value: entity.value,
    };
  }

  static toResponseList(entities: EnumValue[]): EnumResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
