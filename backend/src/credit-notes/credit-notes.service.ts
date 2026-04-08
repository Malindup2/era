import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreditNote } from './entities/credit-note.entity';
import { CreditNoteLineItem } from './entities/credit-note-line-item.entity';

@Injectable()
export class CreditNotesService {
  constructor(
    @InjectRepository(CreditNote)
    private repo: Repository<CreditNote>,
    private dataSource: DataSource,
  ) {}

  async create(data: any, userId: number): Promise<CreditNote> {
    // Credit note create flow also persists the note header and line items atomically.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const creditNoteRepository = queryRunner.manager.getRepository(CreditNote);
      const lineItemRepository = queryRunner.manager.getRepository(CreditNoteLineItem);
      const { lineItems = [], ...creditNoteData } = data;

      // Credit note numbering is derived from the latest global credit note.
      const [lastCrn] = await creditNoteRepository.find({
        order: { number: 'DESC' },
        take: 1,
      });

      let nextNumber = 'CRN-00001';
      if (lastCrn && lastCrn.number.startsWith('CRN-')) {
        const currentNum = parseInt(lastCrn.number.split('-')[1]);
        nextNumber = `CRN-${(currentNum + 1).toString().padStart(5, '0')}`;
      }

      const creditNote = creditNoteRepository.create({
        ...creditNoteData,
        userId,
        number: nextNumber,
      } as any) as unknown as CreditNote;

      const savedCreditNote = await creditNoteRepository.save(creditNote);

      if (Array.isArray(lineItems) && lineItems.length > 0) {
        const creditNoteLineItems = lineItems.map((lineItem: any) => ({
            ...lineItem,
            creditNoteId: savedCreditNote.id,
          }));
        await lineItemRepository.save(creditNoteLineItems);
      }

      const result = await creditNoteRepository.findOne({
        where: { id: savedCreditNote.id, userId },
        relations: ['customer', 'invoice', 'lineItems'],
      });

      await queryRunner.commitTransaction();
      return result as CreditNote;
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
      relations: ['customer', 'invoice', 'lineItems'],
    });
  }

  findOne(id: number, userId: number) {
    return this.repo.findOne({
      where: { id, userId },
      relations: ['customer', 'invoice', 'lineItems'],
    });
  }

  async update(id: number, data: any, userId: number) {
    // Update flow refreshes the credit note lines so amounts stay consistent.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const creditNoteRepository = queryRunner.manager.getRepository(CreditNote);
      const lineItemRepository = queryRunner.manager.getRepository(CreditNoteLineItem);
      const existing = await creditNoteRepository.findOne({
        where: { id, userId },
        relations: ['lineItems'],
      });
      if (!existing) return null;

      const { lineItems = [], ...creditNoteData } = data;
      const updatedCreditNote = creditNoteRepository.merge(existing, creditNoteData);
      await creditNoteRepository.save(updatedCreditNote);

      await lineItemRepository.delete({ creditNoteId: id });

      if (Array.isArray(lineItems) && lineItems.length > 0) {
        const creditNoteLineItems = lineItems.map((lineItem: any) => ({
            ...lineItem,
            creditNoteId: id,
          }));
        await lineItemRepository.save(creditNoteLineItems);
      }

      const result = await creditNoteRepository.findOne({
        where: { id, userId },
        relations: ['customer', 'invoice', 'lineItems'],
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
