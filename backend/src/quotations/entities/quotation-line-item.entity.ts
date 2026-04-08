import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Quotation } from './quotation.entity';
import { Item } from '../../items/entities/item.entity';

@Entity('quotation_line_items')
export class QuotationLineItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @ManyToOne(() => Quotation, (quotation) => quotation.lineItems, { onDelete: 'CASCADE' })
  quotation: Quotation;

  @Column()
  quotationId: number;

  @ManyToOne(() => Item, { eager: false, nullable: true })
  item: Item;

  @Column({ nullable: true })
  itemId: number;
}
