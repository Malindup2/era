import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private repo: Repository<Item>,
  ) {}

  create(data: Partial<Item>, userId: number) {
    const item = this.repo.create({ ...data, userId });
    return this.repo.save(item);
  }

  findAll(userId: number) {
    return this.repo.find({ where: { userId } });
  }

  findOne(id: number, userId: number) {
    return this.repo.findOne({ where: { id, userId } });
  }

  async update(id: number, data: Partial<Item>, userId: number) {
    await this.repo.update({ id, userId }, data);
    return this.findOne(id, userId);
  }

  remove(id: number, userId: number) {
    return this.repo.delete({ id, userId });
  }

  async exportToCsv(userId: number) {
    const items = await this.findAll(userId);
    const header = ['code', 'name', 'type', 'salePrice', 'saleTax', 'description'];
    const rows = items.map(item => [
      item.code,
      item.name,
      item.type,
      item.salePrice,
      item.saleTax || '',
      item.description || '',
    ].join(','));
    return [header.join(','), ...rows].join('\n');
  }

  async importFromCsv(csvContent: string, userId: number) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { imported: 0 };

    const header = lines[0].split(',').map(h => h.trim());
    const dataLines = lines.slice(1);
    
    let importedCount = 0;
    for (const line of dataLines) {
      const values = line.split(',').map(v => v.trim());
      const itemData: any = {};
      header.forEach((h, i) => {
        itemData[h] = values[i];
      });

      // Business Logic: Overwrite if code already exists for this user
      const existing = await this.repo.findOne({ where: { code: itemData.code, userId } });
      if (existing) {
        await this.repo.update({ id: existing.id }, { ...itemData, userId });
      } else {
        await this.repo.save({ ...itemData, userId });
      }
      importedCount++;
    }
    return { imported: importedCount };
  }
}
