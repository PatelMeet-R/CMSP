import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BranchService } from '../domain/branch.service';
import { BranchRegisterDto } from './dto/request/branch-register.request.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { BranchUpdateDto } from './dto/request/branch-update.request.dto';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserResponseDto } from 'src/modules/auth/presentation/dto/response/user.response.dto';
import { Public } from 'src/core/decorators/public.decorator';

@Controller('branch')
export class BranchController {
  constructor(private branchService: BranchService) {}

  @Public()
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getMeAllBranch() {
    const branches = await this.branchService.getMeAllBranch();
    return {
      data: branches,
    };
  }

  @Post('register')
  @Permissions('branch:create')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: BranchRegisterDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    const newlyCreatedBranch = await this.branchService.registerBranch(
      dto,
      user,
    );
    return {
      message: SUCCESSMSG.BRANCH.REGISTERED,
      data: newlyCreatedBranch,
    };
  }

  @Patch(':id')
  @Permissions('branch:update')
  @HttpCode(HttpStatus.OK)
  async update(
    @Body() dto: BranchUpdateDto,
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    const updatedBranch = await this.branchService.updateBranch(id, dto, user);
    return {
      message: SUCCESSMSG.BRANCH.UPDATED,
      data: updatedBranch,
    };
  }
}
