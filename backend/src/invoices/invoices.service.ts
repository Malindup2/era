import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceLineItem } from './entities/invoice-line-item.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private repo: Repository<Invoice>,
    private dataSource: DataSource,
  ) {}

  async create(data: any, userId: number): Promise<Invoice> {
    // Create flow: save the invoice header and line items inside one transaction.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invoiceRepository = queryRunner.manager.getRepository(Invoice);
      const lineItemRepository = queryRunner.manager.getRepository(InvoiceLineItem);
      const { lineItems = [], ...invoiceData } = data;

      // Document numbering is generated from the latest global invoice number.
      const [lastInvoice] = await invoiceRepository.find({
        order: { number: 'DESC' },
        take: 1,
      });

      let nextNumber = 'INV-00001';
      if (lastInvoice && lastInvoice.number.startsWith('INV-')) {
        const currentNum = parseInt(lastInvoice.number.split('-')[1]);
        nextNumber = `INV-${(currentNum + 1).toString().padStart(5, '0')}`;
      }

      const invoice = invoiceRepository.create({
        ...invoiceData,
        userId,
        number: nextNumber,
      } as any) as unknown as Invoice;

      const savedInvoice = await invoiceRepository.save(invoice);

      if (Array.isArray(lineItems) && lineItems.length > 0) {
        const invoiceLineItems = lineItems.map((lineItem: any) => ({
            ...lineItem,
            invoiceId: savedInvoice.id,
          }));
        await lineItemRepository.save(invoiceLineItems);
      }

      const result = await invoiceRepository.findOne({
        where: { id: savedInvoice.id, userId },
        relations: ['customer', 'lineItems'],
      });

      await queryRunner.commitTransaction();
      return result as Invoice;
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

  async update(id: number, data: any, userId: number) {
    // Update flow: replace the parent record and line items together to keep totals aligned.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invoiceRepository = queryRunner.manager.getRepository(Invoice);
      const lineItemRepository = queryRunner.manager.getRepository(InvoiceLineItem);
      const existing = await invoiceRepository.findOne({
        where: { id, userId },
        relations: ['lineItems'],
      });
      if (!existing) return null;

      const { lineItems = [], ...invoiceData } = data;
      const updatedInvoice = invoiceRepository.merge(existing, invoiceData);
      await invoiceRepository.save(updatedInvoice);

      await lineItemRepository.delete({ invoiceId: id });

      if (Array.isArray(lineItems) && lineItems.length > 0) {
        const invoiceLineItems = lineItems.map((lineItem: any) => ({
            ...lineItem,
            invoiceId: id,
          }));
        await lineItemRepository.save(invoiceLineItems);
      }

      const result = await invoiceRepository.findOne({
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

  async markAsPaid(id: number, userId: number) {
    // Status transition used by the invoice actions in the UI.
    await this.repo.update({ id, userId }, { status: InvoiceStatus.PAID });
    return this.findOne(id, userId);
  }

  async markAsSent(id: number, userId: number) {
    // Marks an invoice as viewed/sent so the list screen can reflect the workflow stage.
    await this.repo.update({ id, userId }, { status: InvoiceStatus.VIEWED });
    return this.findOne(id, userId);
  }
}
