import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { PersonalInfoService } from '../../domain/services/personal-info.service';
import { Roles } from 'src/core/decorators/roles.decorators';
import { ROLES } from 'src/common/constants/roles.constant';
import { CreatePersonalInfoDto } from '../dto/request/pi-create.request.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { EmailVerifiedGuard } from 'src/core/guards/email-verified.guard';
import { UpdateByUserPersonalInfoDto } from '../dto/request/user-pi-update.request.dto';
import { AdminUpdatePersonalInfoDto } from '../dto/request/admin-pi-update.request.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';

@Controller('personal-info')
@UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
export class PersonalInfoController {
  constructor(private readonly personalInfoService: PersonalInfoService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLES.STUDENT)
  async registerPersonalInfoDetails(
    dto: CreatePersonalInfoDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.personalInfoService.registerPersonalInfo(
      dto,
      user.id,
    );
    return {
      message: SUCCESSMSG.PERSONAL_INFO.REGISTERED,
      data: res,
    };
  }

  @Patch('update/:personalInfoId')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.STUDENT)
  async updatePersonalInfoByUser(
    @Param('personalInfoId', ParseIntPipe) personalInfoId: number,
    dto: UpdateByUserPersonalInfoDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = this.personalInfoService.updatedByUserPersonalInfo(
      personalInfoId,
      dto,
      user.id,
    );
    return {
      Message: SUCCESSMSG.PERSONAL_INFO.UPDATED,
      data: res,
    };
  }

  @Patch('update/admin/:personalInfoId')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.HOD, ROLES.SUPER_ADMIN)
  async updatePersonalInfoByAdmin(
    @Param('personalInfoId', ParseIntPipe) personalInfoId: number,
    dto: AdminUpdatePersonalInfoDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = this.personalInfoService.updatedByAdminUserPersonalInfo(
      personalInfoId,
      dto,
      user.id,
    );
    return {
      message: SUCCESSMSG.PERSONAL_INFO.UPDATED,
      data: res,
    };
  }
}
