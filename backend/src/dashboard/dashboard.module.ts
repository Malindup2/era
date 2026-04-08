import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CreditNote } from '../credit-notes/entities/credit-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, CreditNote])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
