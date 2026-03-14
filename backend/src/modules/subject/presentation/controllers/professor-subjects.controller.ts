import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ProfessorSubMappingService } from '../../domain/services/professor-subject-mapping.service';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { AssignSubjectDto } from '../dto/request/professor-subjects.request.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { ROLES } from 'src/common/constants/roles.constant';
import { Roles } from 'src/core/decorators/roles.decorators';

@Controller('professor-subject')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfessorSubMappingController {
  constructor(
    private readonly professorSubMappingService: ProfessorSubMappingService,
  ) {}
  @Post('assign-subject')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async assignSubjectToProfessor(
    @Body() dto: AssignSubjectDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.professorSubMappingService.assignSubject(
      dto,
      user.id,
    );
    return {
      data: res,
    };
  }
  @Get('all')
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async findAllAssignSubjectDetails() {
    const res =
      await this.professorSubMappingService.getAllAssignSubjectDetails;
    return { data: res };
  }
  @Get('my-subject')
  @Roles(ROLES.PROFESSOR)
  async findMySubject(@CurrentUser() user: UserResponseDto) {
    const res = await this.professorSubMappingService.getSubjectsByProfessor(
      user.id,
    );
    return { data: res };
  }
}
