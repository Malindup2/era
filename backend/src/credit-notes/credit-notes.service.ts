import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditNote } from './entities/credit-note.entity';

@Injectable()
export class CreditNotesService {
  constructor(
    @InjectRepository(CreditNote)
    private repo: Repository<CreditNote>,
  ) {}

  async create(data: any, userId: number): Promise<CreditNote> {
    const lastCrn = await this.repo.findOne({
      where: { userId },
      order: { id: 'DESC' },
    });

    let nextNumber = 'CRN-00001';
    if (lastCrn && lastCrn.number.startsWith('CRN-')) {
      const currentNum = parseInt(lastCrn.number.split('-')[1]);
      nextNumber = `CRN-${(currentNum + 1).toString().padStart(5, '0')}`;
    }

    const creditNote = this.repo.create({
      ...data,
      userId,
      number: nextNumber,
    }) as any as CreditNote;
    return this.repo.save(creditNote);
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

  remove(id: number, userId: number) {
    return this.repo.delete({ id, userId });
  }
}
