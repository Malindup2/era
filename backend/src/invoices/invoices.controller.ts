import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.invoicesService.create(body, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.invoicesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.findOne(+id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.invoicesService.update(+id, body, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.remove(+id, user.id);
  }

  @Patch(':id/mark-paid')
  markAsPaid(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.markAsPaid(+id, user.id);
  }

  @Patch(':id/send')
  markAsSent(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.markAsSent(+id, user.id);
  }
}
