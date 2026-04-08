import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { InvoiceLineItem } from './invoice-line-item.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  VIEWED = 'viewed',
  AWAITING_PAYMENT = 'awaiting_payment',
  PAID = 'paid',
  REJECTED = 'rejected',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  number: string;

  @Column({ type: 'date' })
  invoiceDate: string;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

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

  @OneToMany(() => InvoiceLineItem, (lineItem) => lineItem.invoice, { cascade: true, eager: true })
  lineItems: InvoiceLineItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
