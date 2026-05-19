import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt.auth.guard';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { DashboardService } from 'src/modules/dashboard/domain/service/dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics(@CurrentUser() user: any) {
    const data = await this.dashboardService.getDashboardMetrics(user);
    return {
      message: 'Dashboard metrics retrieved successfully',
      data,
    };
  }
}
