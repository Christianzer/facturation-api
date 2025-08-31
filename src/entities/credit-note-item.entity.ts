import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CreditNote } from './credit-note.entity';
import { Product } from './product.entity';

@Entity('credit_note_items')
export class CreditNoteItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  vatRate: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  vatAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => CreditNote, (creditNote) => creditNote.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creditNoteId' })
  creditNote: CreditNote;

  @Column()
  creditNoteId: string;

  @ManyToOne(() => Product, (product) => product.creditNoteItems, {
    nullable: true,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  productId: string | null;
}