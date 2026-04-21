import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { PersonalInfoService } from '../../domain/services/personal-info.service';
import { Roles } from 'src/core/decorators/roles.decorators';
import { ROLES } from 'src/common/constants/roles.constant';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { EmailVerifiedGuard } from 'src/core/guards/email-verified.guard';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { UpdatePersonalInfoDto } from 'src/modules/users/presentation/dto/request/update-personal-info.dto';
import { FindUsersPersonalInfoQueryDto } from 'src/common/pagination/dto/find-users-personal-query.dto';
import type { User } from 'src/modules/auth/domain/entities/user.entity';
import {
  ChangeUserRoleDto,
  ToggleStatusDto,
} from 'src/modules/users/presentation/dto/request/update-User.dto';
import { UpdateProfileImageDto } from 'src/modules/users/presentation/dto/request/update-profile-image.dto';
import { UserMapper } from 'src/modules/auth/data/mappers/user.response.mapper';

@Controller('personal-info')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonalInfoController {
  constructor(private readonly personalInfoService: PersonalInfoService) {}
  @Get('profile')
  @Roles(ROLES.STUDENT, ROLES.PROFESSOR, ROLES.HOD, ROLES.SUPER_ADMIN)
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
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async searchStaffForCombobox(
    @CurrentUser() rawUser: User,
    @Query('search') search: string,
    @Query('branchId') branchId: string,
    @Query('limit') limit: string,
  ) {
    const currentUser = UserMapper.toResponseDto(rawUser);
    let finalBranchId = branchId ? parseInt(branchId, 10) : undefined;

    if (currentUser.role === ROLES.HOD) {
      finalBranchId = currentUser.branchId ?? undefined;
    }

    const parsedLimit = limit ? parseInt(limit, 10) : 15;
    const safeSearch = search || '';

    const data = await this.personalInfoService.searchStaffForAssignment(
      safeSearch,
      parsedLimit,
      finalBranchId,
    );

    return {
      message: 'Staff retrieved securely for assignment',
      data: data,
    };
  }

  @Patch('update/:personalInfoId')
  @UseGuards(EmailVerifiedGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD, ROLES.PROFESSOR, ROLES.STUDENT)
  async updatePersonalInfo(
    @Param('personalInfoId', ParseIntPipe) targetProfileId: number,
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
  @HttpCode(HttpStatus.OK)
  @Roles(
    ROLES.PROFESSOR,
    ROLES.HOD,
    ROLES.SUPER_ADMIN,
    ROLES.PROFESSOR,
    ROLES.STUDENT,
  )
  async findAll(
    @Query() query: FindUsersPersonalInfoQueryDto,
    @CurrentUser() rawUser: User,
  ) {
    const mappedUser = UserMapper.toResponseDto(rawUser);
    return this.personalInfoService.findAll(
      query,
      mappedUser.role,
      mappedUser.branchId,
    );
  }

  @Get(':personalInfoId')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD, ROLES.PROFESSOR)
  async getUserProfile(
    @Param('personalInfoId', ParseIntPipe) personalInfoId: number,
    @CurrentUser() currentUser: User,
  ) {
    const res = await this.personalInfoService.getDetailedProfile(
      personalInfoId,
      currentUser,
    );
    return { data: res };
  }
  @Patch('status/:personalInfoId')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async toggleAccountStatus(
    @Param('personalInfoId', ParseIntPipe) personalInfoId: number,
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
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async changeUserRole(
    @Param('personalInfoId', ParseIntPipe) personalInfoId: number,
    @Body() dto: ChangeUserRoleDto,
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    const res = await this.personalInfoService.changeUserRole(
      personalInfoId,
      dto,
      currentUser,
    );

    return {
      message: res.message,
    };
  }
  @Patch('update-image/:personalInfoId')
  @UseGuards(EmailVerifiedGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD, ROLES.PROFESSOR, ROLES.STUDENT)
  async updateProfileImage(
    @Param('personalInfoId', ParseIntPipe) targetProfileId: number,
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
}
