import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSettingController } from 'src/core/system-setting/system-setting.controller';
import { SystemSetting } from 'src/core/system-setting/system-setting.entity';
import { SystemSettingService } from 'src/core/system-setting/system-setting.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting])],
  controllers: [SystemSettingController],
  providers: [SystemSettingService],
  exports: [SystemSettingService],
})
export class SettingsModule {}
