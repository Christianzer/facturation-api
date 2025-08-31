import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreditNote, CreditNoteStatus } from '../entities/credit-note.entity';
import { CreditNoteItem } from '../entities/credit-note-item.entity';
import { CustomersService } from '../customers/customers.service';
import { InvoicesService } from '../invoices/invoices.service';
import { ProductsService } from '../products/products.service';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { UpdateCreditNoteDto } from './dto/update-credit-note.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class CreditNotesService {
  constructor(
    @InjectRepository(CreditNote)
    private creditNotesRepository: Repository<CreditNote>,
    @InjectRepository(CreditNoteItem)
    private creditNoteItemsRepository: Repository<CreditNoteItem>,
    private customersService: CustomersService,
    private invoicesService: InvoicesService,
    private productsService: ProductsService,
  ) {}

  async create(
    createCreditNoteDto: CreateCreditNoteDto,
    user: User,
  ): Promise<CreditNote> {
    const customer = await this.customersService.findOne(
      createCreditNoteDto.customerId,
    );

    if (createCreditNoteDto.invoiceId) {
      await this.invoicesService.findOne(createCreditNoteDto.invoiceId);
    }

    const creditNoteNumber = await this.generateCreditNoteNumber();

    // Préparer les items avec calculs
    let preparedItems: any[] = [];
    let amount = createCreditNoteDto.amount || 0;
    let vatAmount = createCreditNoteDto.vatAmount || 0;

    if (createCreditNoteDto.items && createCreditNoteDto.items.length > 0) {
      amount = 0;
      vatAmount = 0;

      for (const itemData of createCreditNoteDto.items) {
        let product: any = null;
        let unitPrice = itemData.unitPrice || 0;
        let vatRate = itemData.vatRate || 10;

        if (itemData.productId) {
          product = await this.productsService.findOne(itemData.productId);
          unitPrice = itemData.unitPrice || product.price;
          vatRate = itemData.vatRate || product.vatRate;
        }

        const itemSubtotal = unitPrice * itemData.quantity;
        const itemVatAmount = itemSubtotal * (vatRate / 100);
        const itemTotal = itemSubtotal + itemVatAmount;

        preparedItems.push({
          productId: itemData.productId,
          quantity: itemData.quantity,
          unitPrice,
          vatRate,
          subtotal: itemSubtotal,
          vatAmount: itemVatAmount,
          total: itemTotal,
          description: itemData.description || product?.description || 'Service',
        });

        amount += itemSubtotal;
        vatAmount += itemVatAmount;
      }
    }

    const creditNote = new CreditNote();
    creditNote.creditNoteNumber = creditNoteNumber;
    creditNote.userId = user.id;
    creditNote.customerId = createCreditNoteDto.customerId;
    creditNote.invoiceId = createCreditNoteDto.invoiceId || null;
    creditNote.issueDate = new Date(createCreditNoteDto.issueDate);
    creditNote.amount = amount;
    creditNote.vatAmount = vatAmount;
    creditNote.total = amount + vatAmount;
    creditNote.reason = createCreditNoteDto.reason;
    creditNote.notes = createCreditNoteDto.notes || null;

    const savedCreditNote = await this.creditNotesRepository.save(creditNote);
    
    // Save items separately if any
    if (preparedItems.length > 0) {
      const itemsWithCreditNoteId = preparedItems.map(item => ({
        ...item,
        creditNoteId: savedCreditNote.id,
      }));
      await this.creditNoteItemsRepository.save(itemsWithCreditNoteId);
    }

    return this.findOne(savedCreditNote.id);
  }

  async findAll(userId: string): Promise<CreditNote[]> {
    return this.creditNotesRepository.find({
      where: { userId },
      relations: ['customer', 'invoice', 'user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CreditNote> {
    const creditNote = await this.creditNotesRepository.findOne({
      where: { id },
      relations: ['customer', 'invoice', 'user', 'items', 'items.product'],
    });

    if (!creditNote) {
      throw new NotFoundException(`Credit note with ID ${id} not found`);
    }

    return creditNote;
  }

  async update(
    id: string,
    updateCreditNoteDto: UpdateCreditNoteDto,
  ): Promise<CreditNote> {
    const creditNote = await this.findOne(id);

    if (
      updateCreditNoteDto.customerId &&
      updateCreditNoteDto.customerId !== creditNote.customerId
    ) {
      await this.customersService.findOne(updateCreditNoteDto.customerId);
    }

    if (
      updateCreditNoteDto.invoiceId &&
      updateCreditNoteDto.invoiceId !== creditNote.invoiceId
    ) {
      await this.invoicesService.findOne(updateCreditNoteDto.invoiceId);
    }

    if (
      updateCreditNoteDto.amount !== undefined ||
      updateCreditNoteDto.vatAmount !== undefined
    ) {
      const amount = updateCreditNoteDto.amount ?? creditNote.amount;
      const vatAmount = updateCreditNoteDto.vatAmount ?? creditNote.vatAmount;
      updateCreditNoteDto.total = amount + vatAmount;
    }

    Object.assign(creditNote, updateCreditNoteDto);
    return this.creditNotesRepository.save(creditNote);
  }

  async remove(id: string): Promise<void> {
    const creditNote = await this.findOne(id);
    await this.creditNotesRepository.remove(creditNote);
  }

  async updateStatus(
    id: string,
    status: CreditNoteStatus,
  ): Promise<CreditNote> {
    const creditNote = await this.findOne(id);
    creditNote.status = status;
    await this.creditNotesRepository.save(creditNote);
    return this.findOne(id);
  }

  private async generateCreditNoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.creditNotesRepository.count({
      where: {
        creditNoteNumber: Like(`CN-${year}-%`),
      },
    });
    return `CN-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
