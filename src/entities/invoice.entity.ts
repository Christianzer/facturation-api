import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Customer } from './customer.entity';
import { InvoiceItem } from './invoice-item.entity';
import { CreditNote } from './credit-note.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Column({ type: 'date', nullable: true })
  issueDate: Date | null;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  @Column('decimal', { precision: 10, scale: 2, default: 0})
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0})
  vatAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0})
  total: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  paymentTerms: string | null;

  @ManyToOne(() => User, (user) => user.invoices)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Customer, (customer) => customer.invoices)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column()
  customerId: string;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice, {
    cascade: true,
  })
  items: InvoiceItem[];

  @OneToMany(() => CreditNote, (creditNote) => creditNote.invoice)
  creditNotes: CreditNote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
