import { Controller, Get, Post, Patch, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('quotations')
@UseGuards(JwtAuthGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.quotationsService.create(body, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.quotationsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotationsService.findOne(+id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.quotationsService.update(+id, body, user.id);
  }

  @Post(':id/convert')
  async convertToInvoice(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotationsService.convertToInvoice(+id, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotationsService.remove(+id, user.id);
  }
}
