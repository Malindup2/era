import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Quotation } from '../quotations/entities/quotation.entity';
import { CreditNote } from '../credit-notes/entities/credit-note.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private repo: Repository<Customer>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Quotation)
    private quotationRepo: Repository<Quotation>,
    @InjectRepository(CreditNote)
    private creditNoteRepo: Repository<CreditNote>,
  ) {}

  async create(data: Partial<Customer>, userId: number) {
    const customer = this.repo.create({ ...data, userId });
    return this.repo.save(customer);
  }

  findAll(userId: number) {
    return this.repo.find({ where: { userId } });
  }

  findOne(id: number, userId: number) {
    return this.repo.findOne({ where: { id, userId } });
  }

  async update(id: number, data: Partial<Customer>, userId: number) {
    await this.repo.update({ id, userId }, data);
    return this.findOne(id, userId);
  }

  remove(id: number, userId: number) {
    return this.repo.delete({ id, userId });
  }

  async getHistory(id: number, userId: number) {
    const customer = await this.findOne(id, userId);
    if (!customer) return null;

    const [invoices, quotations, creditNotes] = await Promise.all([
      this.invoiceRepo.find({ where: { customerId: id, userId }, order: { createdAt: 'DESC' } }),
      this.quotationRepo.find({ where: { customerId: id, userId }, order: { createdAt: 'DESC' } }),
      this.creditNoteRepo.find({ where: { customerId: id, userId }, order: { createdAt: 'DESC' } }),
    ]);

    return {
      customer,
      invoices,
      quotations,
      creditNotes,
    };
  }
}

