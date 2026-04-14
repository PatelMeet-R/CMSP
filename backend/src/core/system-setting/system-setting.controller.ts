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
import { RolesGuard } from 'src/core/guards/roles-guard';
import { Roles } from 'src/core/decorators/roles.decorators';
import { ROLES } from 'src/common/constants/roles.constant';
import { SystemSettingService } from 'src/core/system-setting/system-setting.service';
import { UpsertSettingDto } from 'src/core/system-setting/system-setting.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemSettingController {
  constructor(private readonly settingService: SystemSettingService) {}

  // Publicly accessible to logged-in users (so the frontend accordion can read it)
  @Get(':key')
  @HttpCode(HttpStatus.OK)
  async getSetting(@Param('key') key: string) {
    const value = await this.settingService.getSettingValue(key);
    return { message: 'Setting retrieved', data: { key, value } };
  }

  // Strictly protected: Only Admins and HODs can change the academic year!
  @Patch('upsert')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async updateSetting(@Body() dto: UpsertSettingDto) {
    const data = await this.settingService.upsertSetting(dto);
    return { message: 'System setting updated successfully', data };
  }
}
