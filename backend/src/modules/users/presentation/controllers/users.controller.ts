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
import type { FindUsersPersonalInfoQueryDto } from 'src/common/pagination/dto/find-users-personal-query.dto';
import type { PaginatedResponse } from 'src/common/pagination/interface/paginated-response.interface';
import type { PersonalInfo } from 'src/modules/users/domain/entities/personal-info.entity';

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
  @Roles(ROLES.PROFESSOR, ROLES.HOD, ROLES.SUPER_ADMIN)
  async findAll(
    @Query() query: FindUsersPersonalInfoQueryDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<PaginatedResponse<PersonalInfo>> {
    return this.personalInfoService.findAll(query, user.role, user.branchId);
  }
}
