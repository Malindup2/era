import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

export enum ItemType {
  PRODUCT = 'product',
  SERVICE = 'service',
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ItemType, default: ItemType.PRODUCT })
  type: ItemType;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salePrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ default: 'No Tax' })
  saleTax: string;

  @Column({ nullable: true })
  purchaseTax: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => User, { eager: false })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
