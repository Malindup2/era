import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer } from './entities/customer.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Quotation } from '../quotations/entities/quotation.entity';
import { CreditNote } from '../credit-notes/entities/credit-note.entity';

@Module({

  imports: [TypeOrmModule.forFeature([Customer, Invoice, Quotation, CreditNote])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}

