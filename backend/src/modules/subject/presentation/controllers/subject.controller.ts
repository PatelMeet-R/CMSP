import {
  Body,
  Controller,
  ForbiddenException,
  Get,
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
import { Roles } from 'src/core/decorators/roles.decorators';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UpdateSubjectDto } from '../dto/request/subject-update.request.dto';
import { CreateSubjectDto } from '../dto/request/subject-register.request.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { ROLES } from 'src/common/constants/roles.constant';
import { SubjectService } from '../../domain/services/subject.service';

@Controller('subject')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}
  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const updated = await this.subjectService.updateSubject(id, dto, user);
    return {
      message: SUCCESSMSG.SUBJECT_UPDATED,
      data: updated,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async createSubject(
    @Body() dto: CreateSubjectDto,
    @CurrentUser() User: UserResponseDto,
  ) {
    const newlyCreatedSubject = await this.subjectService.registerSubject(
      dto,
      User,
    );
    return {
      message: SUCCESSMSG.SUBJECT_CREATED,
      data: newlyCreatedSubject,
    };
  }

  @Get('all-subject')
  @HttpCode(HttpStatus.OK)
  async getSubjects(@CurrentUser() user: UserResponseDto) {
    const subjects =
      user.role === ROLES.SUPER_ADMIN
        ? await this.subjectService.getAllSubjects()
        : await this.subjectService.getSubjectsByBranch(user.branchId!);

    return {
      message: SUCCESSMSG.SUBJECT_FETCHED,
      data: subjects,
    };
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getSubjectById(@Param('id', ParseIntPipe) id: number) {
    const subject = await this.subjectService.getSubjectById(id);

    return {
      message: SUCCESSMSG.SUBJECT_FETCHED,
      data: subject,
    };
  }
  @Get('all-subject/:semesterKey') //SEM01
  @HttpCode(HttpStatus.OK)
  async getSubjectsBySemester(
    @Param('semesterKey') Key: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return await this.subjectService.getSubjectsBySemester(user.branchId!, Key);
  }
}
