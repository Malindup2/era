import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Quotation, QuotationStatus } from './entities/quotation.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { InvoiceLineItem } from '../invoices/entities/invoice-line-item.entity';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private repo: Repository<Quotation>,
    private invoicesService: InvoicesService,
    private dataSource: DataSource,
  ) {}

  async create(data: any, userId: number) {
    const lastQuo = await this.repo.findOne({
      where: { userId },
      order: { id: 'DESC' },
    });

    let nextNumber = 'QUO-00001';
    if (lastQuo && lastQuo.number.startsWith('QUO-')) {
      const currentNum = parseInt(lastQuo.number.split('-')[1]);
      nextNumber = `QUO-${(currentNum + 1).toString().padStart(5, '0')}`;
    }

    const quotation = this.repo.create({
      ...data,
      userId,
      number: nextNumber,
    });
    return this.repo.save(quotation);
  }

  findAll(userId: number) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['customer', 'lineItems'],
    });
  }

  findOne(id: number, userId: number) {
    return this.repo.findOne({
      where: { id, userId },
      relations: ['customer', 'lineItems'],
    });
  }

  async convertToInvoice(id: number, userId: number) {
    const quotation = await this.findOne(id, userId);
    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status === QuotationStatus.CONVERTED) throw new Error('Already converted');

    // Use a transaction for safety
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Invoice
      const invoiceData = {
        customerId: quotation.customerId,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: quotation.expiryDate,
        subtotal: quotation.subtotal,
        taxTotal: quotation.taxTotal,
        total: quotation.total,
        notes: `Converted from Quotation ${quotation.number}. ${quotation.notes || ''}`,
        lineItems: quotation.lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          amount: item.amount,
          itemId: item.itemId,
        })),
      };

      const invoice = await this.invoicesService.create(invoiceData, userId);

      // 2. Update Quotation
      quotation.status = QuotationStatus.CONVERTED;
      quotation.convertedToInvoiceId = invoice.id;
      await queryRunner.manager.save(quotation);

      await queryRunner.commitTransaction();
      return invoice;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, data: any, userId: number) {
    const existing = await this.findOne(id, userId);
    if (!existing) return null;
    
    // We use save() to handle nested children updates
    return this.repo.save({ ...existing, ...data });
  }

  remove(id: number, userId: number) {
    return this.repo.delete({ id, userId });
  }
}
