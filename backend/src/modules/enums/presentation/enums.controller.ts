import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EnumService } from '../domain/enums.service';
import { EnumResponseDto } from './dto/enum.response.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import  { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

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

  @Post(':type')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('setting:manage')
  async createEnum(
    @Param('type') type: string,
    @Body() dto: { key: string; value: string },
    @CurrentUser() user: UserResponseDto,
  ) {
    const created = await this.enumService.createEnumValue(type, dto, user);
    return {
      message: 'System value added successfully',
      data: { id: created.id, key: created.key, value: created.value },
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions('setting:manage')
  async updateEnum(
    @Param('id') id: string,
    @Body() dto: { key?: string; value?: string },
    @CurrentUser() user: UserResponseDto,
  ) {
    const updated = await this.enumService.updateEnumValue(id, dto, user);
    return {
      message: 'System value updated successfully',
      data: { id: updated.id, key: updated.key, value: updated.value },
    };
  }
}
