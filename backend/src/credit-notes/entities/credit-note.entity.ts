import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { CreditNoteLineItem } from './credit-note-line-item.entity';

export enum CreditNoteStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity('credit_notes')
export class CreditNote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  number: string;

  @Column({ type: 'date' })
  creditNoteDate: string;

  @Column({ type: 'enum', enum: CreditNoteStatus, default: CreditNoteStatus.OPEN })
  status: CreditNoteStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxTotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, { eager: false })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Customer, { eager: true })
  customer: Customer;

  @Column()
  customerId: number;

  @ManyToOne(() => Invoice, { eager: true, nullable: true })
  invoice: Invoice;

  @Column({ nullable: true })
  invoiceId: number;

  @OneToMany(() => CreditNoteLineItem, (lineItem) => lineItem.creditNote, { cascade: true, eager: true })
  lineItems: CreditNoteLineItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
