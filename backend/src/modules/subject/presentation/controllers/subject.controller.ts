import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { Roles } from 'src/core/decorators/roles.decorators';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UpdateSubjectDto } from '../dto/request/subject-update.request.dto';
import { CreateSubjectDto } from '../dto/request/subject-register.request.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { ROLES } from 'src/common/constants/roles.constant';
import { SubjectService } from '../../domain/services/subject.service';
import { FindSubjectQueryDto } from 'src/common/pagination/dto/find-subject-query.dto';
import type { User } from 'src/modules/auth/domain/entities/user.entity';
import { UserMapper } from 'src/modules/auth/data/mappers/user.response.mapper';

@Controller('subject')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}
  // ======================================

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.PROFESSOR, ROLES.HOD, ROLES.SUPER_ADMIN, ROLES.STUDENT)
  async getSubjects(
    @Query() query: FindSubjectQueryDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return await this.subjectService.getAllSubject(
      query,
      user.role,
      user.branchId,
    );
  }
  // ======================================

  @Get('search-combobox')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async searchSubjectsForCombobox(
    @CurrentUser() rawUser: User,
    @Query('search') search?: string,
    @Query('semesterId') semesterId?: string,
    @Query('branchId') branchId?: string,
    @Query('limit') limit?: string,
  ) {
   
    const currentUser = UserMapper.toResponseDto(rawUser);

    let finalBranchId = branchId ? parseInt(branchId, 10) : undefined;

  
    if (currentUser.role === ROLES.HOD) {
      finalBranchId = currentUser.branchId ?? undefined; 
    }

    const parsedSemId = semesterId ? parseInt(semesterId, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const safeSearch = search || '';

    const data = await this.subjectService.searchSubjectsForAssignment(
      safeSearch,
      parsedSemId,
      finalBranchId,
      parsedLimit,
    );

    return { message: 'Subjects retrieved', data };
  }
  // ======================================

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async createSubject(
    @Body() dto: CreateSubjectDto,
    @CurrentUser() user: User,
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
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectDto,
    @CurrentUser() user: User,
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
  async getSubject(@Param('id', ParseIntPipe) id: number) {
    const subject = await this.subjectService.getSubjectById(id);

    return {
      message: SUCCESSMSG.SUBJECT.FETCHED,
      data: subject,
    };
  }
  // ======================================
}
