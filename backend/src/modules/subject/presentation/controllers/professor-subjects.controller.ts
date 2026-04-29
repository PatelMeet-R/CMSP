import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProfessorSubMappingService } from '../../domain/services/professor-subject-mapping.service';
import { AssignSubjectDto } from '../dto/request/professor-subjects.request.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { UpdateAssignSubjectDto } from '../dto/request/professor-subjects-update.request.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { FindSubjectMappingQueryDto } from 'src/common/pagination/dto/find-subject-mapping-query.dto';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { BulkCloneAssignmentsDto } from 'src/modules/subject/presentation/dto/request/bulk-clone.dto';

@Controller('professor-subject')
export class ProfessorSubMappingController {
  constructor(
    private readonly professorSubMappingService: ProfessorSubMappingService,
  ) {}
  // ==================================

  @Post('assign-subject')
  @HttpCode(HttpStatus.OK)
  @Permissions('subject-mapping:create')
  async saveAssignedSubjectToProfessor(
    @Body() dto: AssignSubjectDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.professorSubMappingService.saveAssignedSubject(
      dto,
      user,
    );
    return {
      message: SUCCESSMSG.SUBJECT.ASSIGNMENT_CREATED,
      data: res,
    };
  }
  // ==================================

  @Patch('assign-subject/:mappingId')
  @HttpCode(HttpStatus.OK)
  @Permissions('assignment:update')
  async updateAssignSubjectToProfessor(
    @Param('mappingId') mappingId: string,
    @Body() dto: UpdateAssignSubjectDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.professorSubMappingService.updateAssignSubject(
      mappingId,
      dto,
      user,
    );
    return {
      message: SUCCESSMSG.SUBJECT.ASSIGNMENT_UPDATED,
      data: res,
    };
  }

  // ==================================

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions('assignment:read', 'assignment:read-self') // Allows both admins and professors to hit this endpoint
  async getAssignedSubjects(
    @Query() query: FindSubjectMappingQueryDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res =
      await this.professorSubMappingService.getAllAssignSubjectDetails(
        query,
        user,
      );

    return {
      message: SUCCESSMSG.SUBJECT.FETCHED,
      data: res,
    };
  }

  // ==============================

  @Delete('unassign/:mappingId')
  @HttpCode(HttpStatus.OK)
  @Permissions('assignment:delete')
  async unassignSubject(
    @Param('mappingId') mappingId: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.professorSubMappingService.unassignSubject(
      mappingId,
      user,
    );
    return {
      message: res.message,
    };
  }

  // ==================================

  @Get('history/:professorId')
  @HttpCode(HttpStatus.OK)
  @Permissions(
    'assignment:read',
    'assignment:read-self',
    'professor-subject:read',
  )
  async getProfessorHistory(
    @Param('professorId') professorId: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    const history =
      await this.professorSubMappingService.getProfessorSubjectHistory(
        professorId,
        user,
      );
    return {
      message: 'Professor subject history retrieved successfully',
      data: history,
    };
  }
  // ===================
  @Get('my-active-subjects')
  @HttpCode(HttpStatus.OK)
  @Permissions('assignment:read-self')
  async getMyActiveSubjects(
    @Query('academicYearId') academicYearId: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.professorSubMappingService.getMyActiveSubjects(
      user.id,
      academicYearId,
    );
    return {
      message: 'Fetched assigned subjects successfully',
      data: res,
    };
  }
  // ===================
  @Post('bulk-clone')
  @HttpCode(HttpStatus.OK)
  @Permissions('subject-mapping:create')
  
  async bulkCloneAssignments(
    @Body() dto: BulkCloneAssignmentsDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.professorSubMappingService.bulkCloneAssignments(
      dto,
      user,
    );
    return {
      message: res.message,
    };
  }
  // ===================
}
