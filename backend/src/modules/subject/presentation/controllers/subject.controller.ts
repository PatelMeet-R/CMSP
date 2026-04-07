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

@Controller('subject')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getSubject(@Param('id', ParseIntPipe) id: number) {
    const subject = await this.subjectService.getSubjectById(id);

    return {
      message: SUCCESSMSG.SUBJECT.FETCHED,
      data: subject,
    };
  }

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
}
