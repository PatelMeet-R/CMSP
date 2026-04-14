import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { Roles } from 'src/core/decorators/roles.decorators';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { ROLES } from 'src/common/constants/roles.constant';
import { StaffProfileService } from '../../domain/services/staff-profile.service';
import { UpsertStaffProfileDto } from '../dto/request/staff-profile.dto';

@Controller('staff-profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffProfileController {
  constructor(private readonly staffProfileService: StaffProfileService) {}

  //    View a specific staff profile
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD, ROLES.PROFESSOR)
  async getProfile(@Param('userId', ParseIntPipe) userId: number) {
    const data = await this.staffProfileService.getProfileByUserId(userId);
    return { message: 'Profile retrieved successfully', data };
  }

  //    Update/Create a staff profile
  @Patch('update/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async updateProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpsertStaffProfileDto,
  ) {
    const data = await this.staffProfileService.upsertStaffProfile(userId, dto);
    return { message: 'Professional profile updated successfully', data };
  }
}
