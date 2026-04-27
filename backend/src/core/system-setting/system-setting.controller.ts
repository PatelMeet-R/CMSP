import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { SystemSettingService } from 'src/core/system-setting/system-setting.service';
import { UpsertSettingDto } from 'src/core/system-setting/system-setting.dto';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SystemSettingController {
  constructor(private readonly settingService: SystemSettingService) {}

  // Publicly accessible to logged-in users (so the frontend accordion can read it)
  @Get(':key')
  @HttpCode(HttpStatus.OK)
  @Permissions('settings:read')
  async getSetting(@Param('key') key: string) {
    const value = await this.settingService.getSettingValue(key);
    return { message: 'Setting retrieved', data: { key, value } };
  }

  // Strictly protected: Only Admins can change global settings

  @Patch('upsert')
  @HttpCode(HttpStatus.OK)
  @Permissions('settings:manage-global')
  async updateSetting(
    @Body() dto: UpsertSettingDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const data = await this.settingService.upsertSetting(dto, user);
    return { message: 'System setting updated successfully', data };
  }
}
