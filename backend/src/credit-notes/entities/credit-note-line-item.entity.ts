import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { CreditNote } from './credit-note.entity';
import { Item } from '../../items/entities/item.entity';

@Entity('credit_note_line_items')
export class CreditNoteLineItem {
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

  @ManyToOne(() => CreditNote, (creditNote) => creditNote.lineItems, { onDelete: 'CASCADE' })
  creditNote: CreditNote;

  @Column()
  creditNoteId: number;

  @ManyToOne(() => Item, { eager: false, nullable: true })
  item: Item;

  @Column({ nullable: true })
  itemId: number;
}
