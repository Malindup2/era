import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private repo: Repository<Invoice>,
  ) {}

  async create(data: any, userId: number): Promise<Invoice> {
    const lastInvoice = await this.repo.findOne({
      where: { userId },
      order: { id: 'DESC' },
    });

    let nextNumber = 'INV-00001';
    if (lastInvoice && lastInvoice.number.startsWith('INV-')) {
      const currentNum = parseInt(lastInvoice.number.split('-')[1]);
      nextNumber = `INV-${(currentNum + 1).toString().padStart(5, '0')}`;
    }

    const invoice = this.repo.create({
      ...data,
      userId,
      number: nextNumber,
    }) as any as Invoice;

    return this.repo.save(invoice);

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
    // For simplicity, we just save which handles updates if ID is present
    // But TypeORM repo.update doesn't handle cascaded children well
    // So we use save() for comprehensive update
    const existing = await this.findOne(id, userId);
    if (!existing) return null;
    
    return this.repo.save({ ...existing, ...data });
  }

  remove(id: number, userId: number) {
    return this.repo.delete({ id, userId });
  }

  async markAsPaid(id: number, userId: number) {
    await this.repo.update({ id, userId }, { status: InvoiceStatus.PAID });
    return this.findOne(id, userId);
  }

  async markAsSent(id: number, userId: number) {
    await this.repo.update({ id, userId }, { status: InvoiceStatus.VIEWED });
    return this.findOne(id, userId);
  }
}
