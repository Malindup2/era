import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

  async findAll(userId: number) {
    const customers = await this.repo.find({ where: { userId } });
    const overdueInvoices = await this.invoiceRepo.find({
      where: {
        userId,
        status: In(['viewed', 'awaiting_payment', 'draft']), // Not paid/rejected
      },
    });

    const now = new Date();

    return customers.map(customer => {
      const customerOverdueInvoices = overdueInvoices.filter(inv => 
        inv.customerId === customer.id && 
        new Date(inv.dueDate) < now
      );
      
      const overdueBalance = customerOverdueInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
      
      return {
        ...customer,
        overdueBalance,
      };
    });
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

