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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { AssignmentService } from '../domain/assignment.service';
import { CreateAssignmentDto } from './dto/request/create-assignment.request.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import { AssignmentResponseMapper } from '../data/mapper/assignment-response.mapper';
import { UpdateAssignmentDto } from './dto/request/update-assignment.request.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { FindAssignmentQueryDto } from 'src/common/pagination/dto/find-assignment-query.dto';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { hasPermission } from 'src/common/utils/permissions/permission.utils';
import { StatusGuard } from 'src/core/guards/status.guard';

@Controller('assignment')
@UseGuards(JwtAuthGuard, StatusGuard, PermissionsGuard)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get('all')
  @HttpCode(HttpStatus.OK)
  @Permissions('assignment:read', 'assignment:read-self')
  async getAll(
    @Query() query: FindAssignmentQueryDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const hasGlobalAccess = hasPermission(
      user.permissions,
      'assignment:read-all-branches',
    );
    if (!user.branchId && !hasGlobalAccess) {
      throw new ForbiddenException(
        ERRORMESSAGE.ASSIGNMENT_MESSAGE.FORBIDDEN.BRANCH_MISSING,
      );
    }

    const data = await this.assignmentService.getAllAssignments(query, user);
    return {
      data: data,
    };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @Permissions('assignment:read-self')
  async getMyAssignments(
    @Query() query: FindAssignmentQueryDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const data = await this.assignmentService.getMyAssignments(query, user.id);
    return { data };
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('assignment:create')
  async create(
    @Body() dto: CreateAssignmentDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    if (!user.branchId) {
      throw new UnauthorizedException(
        ERRORMESSAGE.DATA_NOT_FOUND(`branch with Id ${user.branchId}`),
      );
    }
    const res = await this.assignmentService.create(dto, user);
    return {
      message: SUCCESSMSG.ASSIGNMENT.CREATED,
      data: AssignmentResponseMapper.toResponseDto(res),
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions('assignment:update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const res = await this.assignmentService.update(id, dto, user);
    return {
      message: SUCCESSMSG.ASSIGNMENT.UPDATED,
      data: AssignmentResponseMapper.toResponseDto(res),
    };
  }

  @Delete(':assignmentId')
  @HttpCode(HttpStatus.OK)
  @Permissions('assignment:delete')
  async remove(
    @Param('assignmentId') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    await this.assignmentService.remove(id, user);
    return { message: SUCCESSMSG.ASSIGNMENT.DELETED };
  }

  @Get(':assignmentId')
  @Permissions('assignment:read', 'assignment:read-self')
  async getSpecificAssignment(@Param('assignmentId') id: string) {
    const res =
      await this.assignmentService.findAssignmentByIdWithAllRelation(id);

    return {
      data: res,
    };
  }
}
