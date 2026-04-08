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
}
