import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { hasPermission } from 'src/common/utils/permissions/permission.utils';
import { PersonalInfoService } from '../../domain/services/personal-info.service';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { EmailVerifiedGuard } from 'src/core/guards/email-verified.guard';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { UpdatePersonalInfoDto } from 'src/modules/users/presentation/dto/request/update-personal-info.dto';
import { FindUsersPersonalInfoQueryDto } from 'src/common/pagination/dto/find-users-personal-query.dto';
import {
  ChangeUserRoleDto,
  ToggleStatusDto,
} from 'src/modules/users/presentation/dto/request/update-User.dto';
import { UpdateProfileImageDto } from 'src/modules/users/presentation/dto/request/update-profile-image.dto';
import { ApproveUserDto } from 'src/modules/users/presentation/dto/request/approve-user.dto';

@Controller('personal-info')
export class PersonalInfoController {
  constructor(private readonly personalInfoService: PersonalInfoService) {}

  @Get('profile')
  @Permissions('profile:read')
  async profile(@CurrentUser() user: UserResponseDto) {
    const res = await this.personalInfoService.getPersonalProfileByAuthId(
      user.id,
    );
    return {
      data: res,
    };
  }

  @Get('search-staff-combobox')
  @HttpCode(HttpStatus.OK)
  @Permissions('user:read', 'assignment:manage')
  async searchStaffForCombobox(
    @CurrentUser() user: UserResponseDto,
    @Query('search') search: string,
    @Query('branchId') branchId: string,
    @Query('limit') limit: string,
  ) {
    const hasGlobalAccess = hasPermission(
      user.permissions,
      'user:read-all-branches',
    );

    const finalBranchId = hasGlobalAccess ? branchId : user.branchId;

    const parsedLimit = limit ? parseInt(limit, 10) : 15;
    const data = await this.personalInfoService.searchStaffForAssignment(
      search || '',
      parsedLimit,
      finalBranchId ?? undefined,
    );

    return {
      message: 'Staff retrieved securely',
      data,
    };
  }

  @Patch('update/:personalInfoId')
  @UseGuards(EmailVerifiedGuard)
  @HttpCode(HttpStatus.OK)
  @Permissions('profile:update')
  async updatePersonalInfo(
    @Param('personalInfoId') targetProfileId: string,
    @Body() dto: UpdatePersonalInfoDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    const res = await this.personalInfoService.updateSmartProfile(
      targetProfileId,
      dto,
      currentUser,
    );

    return {
      message: SUCCESSMSG.PERSONAL_INFO.UPDATED,
      data: res,
    };
  }

  @Get()
  @Permissions('user:read') // Granular permission check
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: FindUsersPersonalInfoQueryDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.personalInfoService.findAll(query, user);
  }

  @Get(':personalInfoId')
  @HttpCode(HttpStatus.OK)
  @Permissions('user:read-detail')
  async getUserProfile(
    @Param('personalInfoId') personalInfoId: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.personalInfoService.getDetailedProfile(personalInfoId, user);
  }

  @Patch('status/:personalInfoId')
  @HttpCode(HttpStatus.OK)
  @Permissions('user:manage-status')
  async toggleAccountStatus(
    @Param('personalInfoId') personalInfoId: string,
    @Body() dto: ToggleStatusDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    const res = await this.personalInfoService.toggleAccountStatus(
      personalInfoId,
      dto,
      currentUser,
    );

    return {
      message: 'Account status updated successfully',
      data: res,
    };
  }

  @Patch('role/:personalInfoId')
  @HttpCode(HttpStatus.OK)
  @Permissions('user:manage-role')
  async changeUserRole(
    @Param('personalInfoId') personalInfoId: string,
    @Body() dto: ChangeUserRoleDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    return await this.personalInfoService.changeUserRole(
      personalInfoId,
      dto,
      currentUser,
    );
  }

  @Patch('update-image/:personalInfoId')
  @UseGuards(EmailVerifiedGuard)
  @HttpCode(HttpStatus.OK)
  @Permissions('profile:update-image')
  async updateProfileImage(
    @Param('personalInfoId') targetProfileId: string,
    @Body() dto: UpdateProfileImageDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    const res = await this.personalInfoService.updateProfileImage(
      targetProfileId,
      dto,
      currentUser,
    );

    return {
      message: 'Profile image updated successfully',
      data: res,
    };
  }

  @Get('pending')
  @HttpCode(HttpStatus.OK)
  // Require permissions to read users and manage statuses
  @Permissions('user:read', 'user:manage-status')
  async getPendingUsers(
    @Query() query: FindUsersPersonalInfoQueryDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    const res = await this.personalInfoService.getPendingUsers(
      query,
      currentUser,
    );
    return {
      message: 'Pending users retrieved successfully',
      data: res,
    };
  }

  @Patch('approve/:personalInfoId')
  @HttpCode(HttpStatus.OK)
  @Permissions('user:manage-status', 'user:manage-role')
  async approvePendingUser(
    @Param('personalInfoId') personalInfoId: string, // UUID
    @Body() dto: ApproveUserDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    const res = await this.personalInfoService.approveUser(
      personalInfoId,
      dto,
      currentUser,
    );

    return {
      message: res.message,
    };
  }
}
