import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.itemsService.create(body, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.itemsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.itemsService.findOne(+id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.itemsService.update(+id, body, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.itemsService.remove(+id, user.id);
  }

  @Get('export')
  async export(@CurrentUser() user: any) {
    return this.itemsService.exportToCsv(user.id);
  }

  @Post('import')
  async import(@Body('csvContent') csvContent: string, @CurrentUser() user: any) {
    return this.itemsService.importFromCsv(csvContent, user.id);
  }
}
