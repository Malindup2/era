import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.customersService.create(body, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.customersService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.findOne(+id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.customersService.update(+id, body, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.remove(+id, user.id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.getHistory(+id, user.id);
  }
}

