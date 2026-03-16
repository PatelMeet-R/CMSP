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
  @Get('all')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async findAllAssignSubjectDetails() {
    const res =
      await this.professorSubMappingService.getAllAssignSubjectDetails;
    return { data: res };
  }

  @Get('my-subject')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.PROFESSOR)
  async findMySubject(@CurrentUser() user: UserResponseDto) {
    const res = await this.professorSubMappingService.getSubjectsByProfessor(
      user.id,
    );
    return { data: res };
  }
}
