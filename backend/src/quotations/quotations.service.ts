import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Quotation, QuotationStatus } from './entities/quotation.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { InvoiceLineItem } from '../invoices/entities/invoice-line-item.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { QuotationLineItem } from './entities/quotation-line-item.entity';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private repo: Repository<Quotation>,
    private invoicesService: InvoicesService,
    private dataSource: DataSource,
  ) {}

  async create(data: any, userId: number) {
    // Quotation create flow mirrors invoices: header plus line items in one transaction.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const quotationRepository = queryRunner.manager.getRepository(Quotation);
      const lineItemRepository = queryRunner.manager.getRepository(QuotationLineItem);
      const { lineItems = [], ...quotationData } = data;

      // Quotation numbers are assigned from the latest global quotation record.
      const [lastQuo] = await quotationRepository.find({
        order: { number: 'DESC' },
        take: 1,
      });

      let nextNumber = 'QUO-00001';
      if (lastQuo && lastQuo.number.startsWith('QUO-')) {
        const currentNum = parseInt(lastQuo.number.split('-')[1]);
        nextNumber = `QUO-${(currentNum + 1).toString().padStart(5, '0')}`;
      }

      const quotation = quotationRepository.create({
        ...quotationData,
        userId,
        number: nextNumber,
      } as any) as unknown as Quotation;

      const savedQuotation = await quotationRepository.save(quotation);

      if (Array.isArray(lineItems) && lineItems.length > 0) {
        const quotationLineItems = lineItems.map((lineItem: any) => ({
            ...lineItem,
            quotationId: savedQuotation.id,
          }));
        await lineItemRepository.save(quotationLineItems);
      }

      const result = await quotationRepository.findOne({
        where: { id: savedQuotation.id, userId },
        relations: ['customer', 'lineItems'],
      });

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
    // Business flow: quotation gets converted into a new invoice and linked back.
    const quotation = await this.findOne(id, userId);
    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status === QuotationStatus.CONVERTED) throw new Error('Already converted');

    // Use a transaction for safety
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invoiceRepository = queryRunner.manager.getRepository(Invoice);
      const invoiceLineItemRepository = queryRunner.manager.getRepository(InvoiceLineItem);
      const quotationRepository = queryRunner.manager.getRepository(Quotation);

      // Step 1: create the invoice from the quotation snapshot.
      const [lastInvoice] = await invoiceRepository.find({
        order: { number: 'DESC' },
        take: 1,
      });

      let nextInvoiceNumber = 'INV-00001';
      if (lastInvoice && lastInvoice.number.startsWith('INV-')) {
        const currentNum = parseInt(lastInvoice.number.split('-')[1]);
        nextInvoiceNumber = `INV-${(currentNum + 1).toString().padStart(5, '0')}`;
      }

      const invoiceData = {
        customerId: quotation.customerId,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: quotation.expiryDate,
        subtotal: quotation.subtotal,
        taxTotal: quotation.taxTotal,
        total: quotation.total,
        notes: `Converted from Quotation ${quotation.number}. ${quotation.notes || ''}`,
      };

      const invoice = invoiceRepository.create({
        ...invoiceData,
        userId,
        number: nextInvoiceNumber,
      });

      const savedInvoice = await invoiceRepository.save(invoice);

      const invoiceLineItems = quotation.lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          amount: item.amount,
          itemId: item.itemId,
          invoiceId: savedInvoice.id,
        }));

      await invoiceLineItemRepository.save(invoiceLineItems);

      // Step 2: mark the quotation as converted and store the invoice link.
      quotation.status = QuotationStatus.CONVERTED;
      quotation.convertedToInvoiceId = savedInvoice.id;
      await quotationRepository.save(quotation);

      const result = await invoiceRepository.findOne({
        where: { id: savedInvoice.id, userId },
        relations: ['customer', 'lineItems'],
      });

      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, data: any, userId: number) {
    // Update flow keeps the quotation header and line items synchronized.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const quotationRepository = queryRunner.manager.getRepository(Quotation);
      const lineItemRepository = queryRunner.manager.getRepository(QuotationLineItem);
      const existing = await quotationRepository.findOne({
        where: { id, userId },
        relations: ['lineItems'],
      });
      if (!existing) return null;

      const { lineItems = [], ...quotationData } = data;
      const updatedQuotation = quotationRepository.merge(existing, quotationData);
      await quotationRepository.save(updatedQuotation);

      await lineItemRepository.delete({ quotationId: id });

      if (Array.isArray(lineItems) && lineItems.length > 0) {
        const quotationLineItems = lineItems.map((lineItem: any) => ({
            ...lineItem,
            quotationId: id,
          }));
        await lineItemRepository.save(quotationLineItems);
      }

      const result = await quotationRepository.findOne({
        where: { id, userId },
        relations: ['customer', 'lineItems'],
      });

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  remove(id: number, userId: number) {
    return this.repo.delete({ id, userId });
  }
}
