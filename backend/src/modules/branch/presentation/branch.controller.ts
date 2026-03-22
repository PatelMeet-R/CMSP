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
import { BranchService } from '../domain/branch.service';
import { BranchRegisterDto } from './dto/request/branch-register.request.dto';
import { SUCCESSMSG } from 'src/common/constants/success.message';
import { BranchUpdateDto } from './dto/request/branch-update.request.dto';
import { RolesGuard } from 'src/core/guards/roles-guard';
import { Roles } from 'src/core/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { ROLES } from 'src/common/constants/roles.constant';

@Controller('branch')
export class BranchController {
  constructor(private branchService: BranchService) {}
  @Get('health')
  health() {
    return {
      message: ' branch controller working fine',
    };
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getMeAllBranch() {
    const branches = await this.branchService.getMeAllBranch();
    return {
      data: branches,
    };
  }
  @Post('register')
  @Roles(ROLES.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: BranchRegisterDto) {
    const newlyCreatedBranch = await this.branchService.registerBranch(dto);
    return {
      message: SUCCESSMSG.BRANCH.REGISTERED,
      data: newlyCreatedBranch,
    };
  }
  @Patch(':id')
  @Roles(ROLES.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Body() dto: BranchUpdateDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const updatedBranch = await this.branchService.updateBranch(id, dto);
    return {
      message: SUCCESSMSG.BRANCH.UPDATED,
      data: updatedBranch,
    };
  }
}
