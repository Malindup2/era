import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { QuotationLineItem } from './quotation-line-item.entity';

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CONVERTED = 'converted',
}

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  number: string;

  @Column({ type: 'date' })
  quotationDate: string;

  @Column({ type: 'date' })
  expiryDate: string;

  @Column({ type: 'enum', enum: QuotationStatus, default: QuotationStatus.DRAFT })
  status: QuotationStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxTotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  convertedToInvoiceId: number;

  @ManyToOne(() => User, { eager: false })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Customer, { eager: true })
  customer: Customer;

  @Column()
  customerId: number;

  @OneToMany(() => QuotationLineItem, (lineItem) => lineItem.quotation, { cascade: true, eager: true })
  lineItems: QuotationLineItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
