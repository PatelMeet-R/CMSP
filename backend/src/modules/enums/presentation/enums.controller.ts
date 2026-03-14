import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { EnumService } from '../domain/enums.service';
import { EnumResponseDto } from './dto/enum.response.dto';

@Controller('enums')
export class EnumController {
  constructor(private enumService: EnumService) {}

  @Get(':type')
  @HttpCode(HttpStatus.OK)
  async getEnums(@Param('type') type: string): Promise<EnumResponseDto[]> {
    const enums = await this.enumService.getMeAllEnumValues(type);
    return enums.map((e) => ({
      key: e.key,
      value: e.value,
    }));
  }
}
