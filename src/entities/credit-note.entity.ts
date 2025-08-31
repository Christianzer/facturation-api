import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Customer } from './customer.entity';
import { Invoice } from './invoice.entity';

export enum CreditNoteStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  APPLIED = 'applied',
  CANCELLED = 'cancelled',
}

@Entity('credit_notes')
export class CreditNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  creditNoteNumber: string;

  @Column({
    type: 'enum',
    enum: CreditNoteStatus,
    default: CreditNoteStatus.DRAFT,
  })
  status: CreditNoteStatus;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  vatAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, (user) => user.creditNotes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Customer, (customer) => customer.creditNotes)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column()
  customerId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.creditNotes, {
    nullable: true,
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ nullable: true })
  invoiceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
