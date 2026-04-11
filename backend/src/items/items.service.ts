import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item, ItemType } from './entities/item.entity';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

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
    return stringify(items, {
      header: true,
      columns: {
        code: 'code',
        name: 'name',
        type: 'type',
        salePrice: 'salePrice',
        saleTax: 'saleTax',
        description: 'description',
      },
    });
  }

  async importFromCsv(csvContent: string, userId: number) {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    if (records.length === 0) return { imported: 0 };

    let importedCount = 0;
    for (const record of records) {
      const normalizedType =
        record.type?.trim().toLowerCase() === ItemType.SERVICE
          ? ItemType.SERVICE
          : ItemType.PRODUCT;

      const itemData = {
        code: record.code?.trim(),
        name: record.name?.trim(),
        type: normalizedType,
        salePrice: Number(record.salePrice ?? 0),
        saleTax: record.saleTax?.trim() || 'No Tax',
        description: record.description?.trim() || '',
      };

      if (!itemData.code || !itemData.name) {
        continue;
      }

      // Business logic: overwrite if code already exists for this user.
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
