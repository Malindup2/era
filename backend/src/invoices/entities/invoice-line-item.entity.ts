import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Item } from '../../items/entities/item.entity';

@Entity('invoice_line_items')
export class InvoiceLineItem {
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

  @ManyToOne(() => Invoice, (invoice) => invoice.lineItems, { onDelete: 'CASCADE' })
  invoice: Invoice;

  @Column()
  invoiceId: number;

  @ManyToOne(() => Item, { eager: false, nullable: true })
  item: Item;

  @Column({ nullable: true })
  itemId: number;
}
