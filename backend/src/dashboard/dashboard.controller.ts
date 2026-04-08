import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: any) {
    return this.dashboardService.getSummary(user.id);
  }

  @Get('invoice-overview')
  getInvoiceOverview(@CurrentUser() user: any) {
    return this.dashboardService.getInvoiceOverview(user.id);
  }

  @Get('cash-flow')
  getCashFlow(@CurrentUser() user: any) {
    return this.dashboardService.getCashFlow(user.id);
  }
}
