import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
  ) {}

  async getSummary(userId: number) {
    const invoices = await this.invoiceRepo.find({ where: { userId } });

    const totalReceivables = invoices
      .filter(inv => ![InvoiceStatus.PAID, InvoiceStatus.REJECTED].includes(inv.status))
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const bankBalance = invoices
      .filter(inv => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    return {
      totalReceivables,
      totalPayables: 0,
      bankBalance,
      netProfit: bankBalance,
    };
  }

  async getInvoiceOverview(userId: number) {
    const invoices = await this.invoiceRepo.find({ where: { userId } });
    const today = new Date();

    const paidTotal = invoices
      .filter(inv => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    const overdueTotal = invoices
      .filter(inv => 
        inv.status !== InvoiceStatus.PAID && 
        inv.status !== InvoiceStatus.REJECTED && 
        new Date(inv.dueDate) < today
      )
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    return {
      paidTotal,
      overdueTotal,
    };
  }

  async getCashFlow(userId: number) {
    // This would typically group by month. For now, we return a simple mock-up structure
    // consistent with what a chart library might expect.
    return [
      { month: 'Jan', incoming: 4000, outgoing: 2400 },
      { month: 'Feb', incoming: 3000, outgoing: 1398 },
      { month: 'Mar', incoming: 2000, outgoing: 3800 },
      { month: 'Apr', incoming: 2780, outgoing: 3908 },
      { month: 'May', incoming: 1890, outgoing: 4800 },
      { month: 'Jun', incoming: 2390, outgoing: 3800 },
    ];
  }
}
