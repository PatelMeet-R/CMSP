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
import { ProfessorSubMappingService } from '../../domain/services/professor-subject-mapping.service';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { AssignSubjectDto } from '../dto/request/professor-subjects.request.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { ROLES } from 'src/common/constants/roles.constant';
import { Roles } from 'src/core/decorators/roles.decorators';
import { UpdateAssignSubjectDto } from '../dto/request/professor-subjects-update.request.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import type { FindSubjectMappingQueryDto } from 'src/common/pagination/dto/find-subject-mapping-query.dto';

@Controller('professor-subject')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfessorSubMappingController {
  constructor(
    private readonly professorSubMappingService: ProfessorSubMappingService,
  ) {}
  @Post('assign-subject')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async saveAssignedSubjectToProfessor(
    @Body() dto: AssignSubjectDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.professorSubMappingService.saveAssignedSubject(
      dto,
      user.id,
    );
    return {
      message: SUCCESSMSG.SUBJECT.ASSIGNMENT_CREATED,
      data: res,
    };
  }
  @Patch('assign-subject/:professorId')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async updateAssignSubjectToProfessor(
    @Param('professorId', ParseIntPipe) professorId: number,
    @Body() dto: UpdateAssignSubjectDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.professorSubMappingService.updateAssignSubject(
      professorId,
      dto,
      user.id,
    );
    return {
      message: SUCCESSMSG.SUBJECT.ASSIGNMENT_UPDATED,
      data: res,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD, ROLES.PROFESSOR)
  async getAssignedSubjects(
    @Query() query: FindSubjectMappingQueryDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res =
      await this.professorSubMappingService.getAllAssignSubjectDetails(
        query,
        user.id,
        user.role,
        user.branchId,
      );

    return {
      message: SUCCESSMSG.SUBJECT.FETCHED,
      data: res,
    };
  }
}
