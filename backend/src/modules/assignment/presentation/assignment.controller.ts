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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { AssignmentService } from '../domain/assignment.service';
import { Roles } from 'src/core/decorators/roles.decorators';
import { ROLES } from 'src/common/constants/roles.constant';
import { CreateAssignmentDto } from './dto/request/create-assignment.request.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { AssignmentResponseMapper } from '../data/mapper/assignment-response.mapper';
import { UpdateAssignmentDto } from './dto/request/update-assignment.request.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';

@Controller('assignment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLES.HOD, ROLES.PROFESSOR)
  async create(
    @Body() dto: CreateAssignmentDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    if (!user.branchId) {
      throw new UnauthorizedException(
        ERRORMESSAGE.DATA_NOT_FOUND(`branch with Id ${user.branchId}`),
      );
    }
    const res = await this.assignmentService.create(
      dto,
      user.id,
      user.branchId,
      user.role,
    );
    return {
      message: SUCCESSMSG.ASSIGNMENT.CREATED,
      data: AssignmentResponseMapper.toResponseDto(res),
    };
  }
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.HOD, ROLES.PROFESSOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.assignmentService.updateAssignment(
      id,
      dto,
      user.id,
      user.role,
    );
    return {
      message: SUCCESSMSG.ASSIGNMENT.UPDATED,
      data: AssignmentResponseMapper.toResponseDto(res),
    };
  }
  @Delete(':assignmentId')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD, ROLES.PROFESSOR)
  async remove(
    @Param('assignmentId', ParseIntPipe) id: number,
    @CurrentUser() user: UserResponseDto,
  ) {
    if (!user.branchId && user.role !== ROLES.SUPER_ADMIN) {
      throw new UnauthorizedException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.BRANCH_MISSING,
      );
    }
    await this.assignmentService.remove(id, user.id, user.role, user.branchId);
    return { message: SUCCESSMSG.ASSIGNMENT.DELETED };
  }
  @Get(':semesterId/by-semester')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.HOD, ROLES.PROFESSOR, ROLES.STUDENT)
  async getAllAssignmentByFilter(
    @CurrentUser() user: UserResponseDto,
    @Param('semesterId', ParseIntPipe) id: number,
  ) {
    if (!user.branchId) {
      throw new ForbiddenException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.BRANCH_MISSING,
      );
    }

    const res = await this.assignmentService.findAllAssignmentByFilter(
      user.branchId,
      id,
    );
    return { data: res };
  }
  @Get(':assignmentId')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD, ROLES.PROFESSOR, ROLES.STUDENT)
  async getSpecificAssignment(@Param('assignmentId', ParseIntPipe) id: number) {
    const res =
      await this.assignmentService.findAssignmentByIdWithAllRelation(id);

    return {
      data: res,
    };
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.SUPER_ADMIN, ROLES.HOD)
  async getAll(@CurrentUser() user: UserResponseDto) {
    if (!user.branchId && user.role !== ROLES.HOD) {
      throw new ForbiddenException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.BRANCH_MISSING,
      );
    }
    const data = await this.assignmentService.getAllAssignment(
      user.role,
      user.branchId,
    );
    return {
      data: data,
    };
  }
}
