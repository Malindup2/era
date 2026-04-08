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

    // Receivables are invoices that are NOT paid and NOT rejected
    const totalReceivables = invoices
      .filter(inv => ![InvoiceStatus.PAID, InvoiceStatus.REJECTED].includes(inv.status))
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    // Bank Balance is the sum of all PAID invoices
    const bankBalance = invoices
      .filter(inv => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    return {
      totalReceivables,
      totalPayables: 0, // Out of scope as per README.md
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
    const invoices = await this.invoiceRepo.find({ 
      where: { userId, status: InvoiceStatus.PAID } 
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize current year monthly data
    const cashFlowMap: Record<string, { month: string; incoming: number; outgoing: number }> = {};
    months.forEach(m => {
      cashFlowMap[m] = { month: m, incoming: 0, outgoing: 0 };
    });

    invoices.forEach(inv => {
      const date = new Date(inv.invoiceDate);
      if (date.getFullYear() === currentYear) {
        const monthName = months[date.getMonth()];
        cashFlowMap[monthName].incoming += Number(inv.total);
      }
    });

    // Return the last 6 months or current year up to now? 
    // Let's return the full year data for the chart to be comprehensive.
    return Object.values(cashFlowMap);
  }
}
