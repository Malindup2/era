import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { CreditNotesService } from './credit-notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('credit-notes')
@UseGuards(JwtAuthGuard)
export class CreditNotesController {
  constructor(private readonly creditNotesService: CreditNotesService) {}

  @Post()
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.creditNotesService.create(body, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.creditNotesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.creditNotesService.findOne(+id, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.creditNotesService.remove(+id, user.id);
  }
}
