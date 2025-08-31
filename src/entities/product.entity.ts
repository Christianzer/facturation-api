import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { InvoiceItem } from './invoice-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 5, scale: 2, default: 20.0 })
  vatRate: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.product)
  invoiceItems: InvoiceItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
