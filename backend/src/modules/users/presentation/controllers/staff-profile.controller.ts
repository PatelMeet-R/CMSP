import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { StaffProfileService } from '../../domain/services/staff-profile.service';
import { UpsertStaffProfileDto } from '../dto/request/staff-profile.dto';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import  { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';

@Controller('staff-profile')
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
