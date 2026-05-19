import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UpdateSubjectDto } from '../dto/request/subject-update.request.dto';
import { CreateSubjectDto } from '../dto/request/subject-register.request.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { SubjectService } from '../../domain/services/subject.service';
import { FindSubjectQueryDto } from 'src/common/pagination/dto/find-subject-query.dto';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { hasPermission } from 'src/common/utils/permissions/permission.utils';
import { StatusGuard } from 'src/core/guards/status.guard';
import { Public } from 'src/core/decorators/public.decorator';
import { AllowInactive } from 'src/core/decorators/allow-inactive.decorator';

@Controller('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}
  // ======================================

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions('subject:read')
  async getSubjects(
    @Query() query: FindSubjectQueryDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return await this.subjectService.getAllSubject(query, user);
  }
  // ======================================

  @Get('search-combobox')
  @HttpCode(HttpStatus.OK)
  @Permissions('subject:read', 'assignment:manage')
  async searchSubjectsForCombobox(
    @CurrentUser() user: UserResponseDto,
    @Query('search') search?: string,
    @Query('semesterId') semesterId?: string,
    @Query('branchId') branchId?: string,
    @Query('limit') limit?: string,
  ) {
    const hasGlobalAccess = hasPermission(
      user.permissions,
      'subject:read-all-branches',
    );
    const finalBranchId = hasGlobalAccess ? branchId : user.branchId;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const safeSearch = search || '';

    const data = await this.subjectService.searchSubjectsForAssignment(
      safeSearch,
      semesterId,
      finalBranchId ?? undefined,
      parsedLimit,
    );

    return { message: 'Subjects retrieved', data };
  }
  // ======================================

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('subject:create')
  async createSubject(
    @Body() dto: CreateSubjectDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const newlyCreatedSubject = await this.subjectService.registerSubject(
      dto,
      user,
    );
    return {
      message: SUCCESSMSG.SUBJECT.CREATED,
      data: newlyCreatedSubject,
    };
  }
  // ======================================

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions('subject:update')
  async updateSubject(
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const updated = await this.subjectService.updateSubject(id, dto, user);
    return {
      message: SUCCESSMSG.SUBJECT.UPDATED,
      data: updated,
    };
  }
  // ======================================

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions('subject:read-detail')
  async getSubject(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    const subject = await this.subjectService.getSubjectById(id, user);

    return {
      message: SUCCESSMSG.SUBJECT.FETCHED,
      data: subject,
    };
  }
  // ======================================
}
