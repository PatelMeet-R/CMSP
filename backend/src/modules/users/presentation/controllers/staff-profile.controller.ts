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
import { StaffProfileService } from '../../domain/services/staff-profile.service';
import { UpsertStaffProfileDto } from '../dto/request/staff-profile.dto';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

@Controller('staff-profile')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StaffProfileController {
  constructor(private readonly staffProfileService: StaffProfileService) {}

  //    View a specific staff profile
  @Get(':userId')
  @Permissions('staff:read')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    const data = await this.staffProfileService.getProfileByUserId(
      userId,
      currentUser,
    );
    return { message: 'Profile retrieved successfully', data };
  }

  //    Update/Create a staff profile
  @Patch('update/:userId')
  @Permissions('staff:update')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Param('userId') userId: string,
    @Body() dto: UpsertStaffProfileDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    const data = await this.staffProfileService.upsertStaffProfile(
      userId,
      dto,
      currentUser,
    );
    return { message: 'Professional profile updated successfully', data };
  }
}
