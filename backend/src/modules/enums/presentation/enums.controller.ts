import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { EnumService } from '../domain/enums.service';
import { EnumResponseDto } from './dto/enum.response.dto';
import { Public } from 'src/core/decorators/public.decorator';

@Controller('enums')
export class EnumController {
  constructor(private enumService: EnumService) {}

  @Public()
  @Get(':type')
  @HttpCode(HttpStatus.OK)
  async getEnums(@Param('type') type: string): Promise<EnumResponseDto[]> {
    const enums = await this.enumService.getMeAllEnumValues(type);
    return enums.map((e) => ({
      id: e.id,
      key: e.key,
      value: e.value,
    }));
  }
}
