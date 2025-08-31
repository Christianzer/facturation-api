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

export enum FneStatus {
  DRAFT = 'draft',
  CERTIFIED = 'certified',
  FAILED = 'failed',
}

export enum PaymentMethod {
  CASH = 'cash',
  MOBILE_MONEY = 'mobile-money',
  CARD = 'card',
  CHECK = 'chek',
  TRANSFER = 'transfert',
  DEFERRED = 'deferred',
}

export enum TemplateFacturation {
  B2C = 'B2C',
  B2B = 'B2B',
  B2G = 'B2G',
  B2F = 'B2F',
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

  @Column({ type: 'varchar', length: 50, nullable: true })
  fneReference: string | null;

  @Column({ type: 'text', nullable: true })
  fneToken: string | null;

  @Column({ type: 'enum', enum: FneStatus, default: FneStatus.DRAFT })
  fneStatus: FneStatus;

  @Column({ type: 'timestamp', nullable: true })
  fneCertifiedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  balanceSticker: number | null;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod | null;

  @Column({ type: 'enum', enum: TemplateFacturation, default: TemplateFacturation.B2C })
  templateFacturation: TemplateFacturation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
