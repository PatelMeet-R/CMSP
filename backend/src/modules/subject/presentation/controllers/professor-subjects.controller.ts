import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { FindSubjectMappingQueryDto } from 'src/common/pagination/dto/find-subject-mapping-query.dto';

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
  // ==============================
  @Delete('unassign/:mappingId')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async unassignSubject(
    @Param('mappingId', ParseIntPipe) mappingId: number,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.professorSubMappingService.unassignSubject(
      mappingId,
      user.id,
    );
    return {
      message: res.message,
    };
  }

  @Get('history/:professorId')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD, ROLES.PROFESSOR)
  async getProfessorHistory(
    @Param('professorId', ParseIntPipe) professorId: number,
    @CurrentUser() user: UserResponseDto,
  ) {
    if (user.role === ROLES.PROFESSOR && user.id !== professorId) {
      throw new ForbiddenException(
        "You cannot view another professor's history.",
      );
    }

    const history =
      await this.professorSubMappingService.getProfessorSubjectHistory(
        professorId,
      );
    return {
      message: 'Professor subject history retrieved successfully',
      data: history,
    };
  }
  // ===================
}
