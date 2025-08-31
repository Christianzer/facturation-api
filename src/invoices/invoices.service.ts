import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Invoice, InvoiceStatus, TemplateFacturation, FneStatus } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { User } from '../entities/user.entity';
import { FneService } from '../fne/fne.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
    private customersService: CustomersService,
    private productsService: ProductsService,
    private fneService: FneService,
  ) {}

  async create(
    createInvoiceDto: CreateInvoiceDto,
    user: User,
  ): Promise<Invoice> {
    const customer = await this.customersService.findOne(
      createInvoiceDto.customerId,
    );

    const invoiceNumber = await this.generateInvoiceNumber();
    
    // Handle draft status and dates
    const status = createInvoiceDto.status || InvoiceStatus.DRAFT;
    const issueDate = createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : (status !== InvoiceStatus.DRAFT ? new Date() : null);
    const dueDate = createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : (status !== InvoiceStatus.DRAFT && issueDate ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null);

    // Préparer les items avec calculs
    let preparedItems: any[] = [];
    let subtotal = 0;
    let vatAmount = 0;

    if (createInvoiceDto.items && createInvoiceDto.items.length > 0) {
      for (const itemData of createInvoiceDto.items) {
        let product: any = null;
        let unitPrice = itemData.unitPrice || 0;
        let vatRate = itemData.vatRate !== undefined ? itemData.vatRate : 18;

        if (itemData.productId) {
          product = await this.productsService.findOne(itemData.productId);
          unitPrice = itemData.unitPrice || product.price;
          if (itemData.vatRate === undefined) {
            vatRate = product.vatRate;
          }
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

        subtotal += itemSubtotal;
        vatAmount += itemVatAmount;
      }
    }

    const invoice = new Invoice();
    invoice.invoiceNumber = invoiceNumber;
    invoice.userId = user.id;
    invoice.customerId = createInvoiceDto.customerId;
    invoice.status = status;
    invoice.issueDate = issueDate;
    invoice.dueDate = dueDate;
    invoice.subtotal = subtotal;
    invoice.vatAmount = vatAmount;
    invoice.total = subtotal + vatAmount;
    invoice.notes = createInvoiceDto.notes || null;
    invoice.paymentTerms = createInvoiceDto.paymentTerms || null;
    invoice.paymentMethod = createInvoiceDto.paymentMethod || null;
    invoice.templateFacturation = createInvoiceDto.templateFacturation || TemplateFacturation.B2C;

    const savedInvoice = await this.invoicesRepository.save(invoice);
    
    // Save items separately if any
    if (preparedItems.length > 0) {
      const itemsWithInvoiceId = preparedItems.map(item => ({
        ...item,
        invoiceId: savedInvoice.id,
      }));
      await this.invoiceItemsRepository.save(itemsWithInvoiceId);
    }

    return this.findOne(savedInvoice.id);
  }

  async findAll(userId: string): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      where: { userId },
      relations: ['customer', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.product', 'user'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (
      updateInvoiceDto.customerId &&
      updateInvoiceDto.customerId !== invoice.customerId
    ) {
      await this.customersService.findOne(updateInvoiceDto.customerId);
    }

    // Si on met à jour les items
    if (updateInvoiceDto.items) {
      // Supprimer les anciens items
      await this.invoiceItemsRepository.delete({ invoiceId: id });

      // Préparer les nouveaux items avec calculs
      let preparedItems: any[] = [];
      let subtotal = 0;
      let vatAmount = 0;

      for (const itemData of updateInvoiceDto.items) {
        let product: any = null;
        let unitPrice = itemData.unitPrice || 0;
        let vatRate = itemData.vatRate !== undefined ? itemData.vatRate : 18;

        if (itemData.productId) {
          product = await this.productsService.findOne(itemData.productId);
          unitPrice = itemData.unitPrice || product.price;
          if (itemData.vatRate === undefined) {
            vatRate = product.vatRate;
          }
        }

        const itemSubtotal = unitPrice * itemData.quantity;
        const itemVatAmount = itemSubtotal * (vatRate / 100);
        const itemTotal = itemSubtotal + itemVatAmount;

        preparedItems.push({
          invoiceId: id,
          productId: itemData.productId,
          quantity: itemData.quantity,
          unitPrice,
          vatRate,
          subtotal: itemSubtotal,
          vatAmount: itemVatAmount,
          total: itemTotal,
          description: itemData.description || product?.description || 'Service',
        });

        subtotal += itemSubtotal;
        vatAmount += itemVatAmount;
      }

      // Créer les nouveaux items
      await this.invoiceItemsRepository.save(preparedItems);

      // Mettre à jour les totaux de la facture
      updateInvoiceDto.subtotal = subtotal;
      updateInvoiceDto.vatAmount = vatAmount;
      updateInvoiceDto.total = subtotal + vatAmount;
    }

    Object.assign(invoice, updateInvoiceDto);
    await this.invoicesRepository.save(invoice);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoicesRepository.remove(invoice);
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.status = status;
    await this.invoicesRepository.save(invoice);
    return this.findOne(id);
  }

  async certifyWithFne(id: string): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.fneStatus === FneStatus.CERTIFIED) {
      throw new BadRequestException('Invoice is already certified with FNE');
    }

    try {
      const fneResponse = await this.fneService.certifyInvoice(invoice);

      if (fneResponse.success && fneResponse.data) {
        invoice.fneStatus = FneStatus.CERTIFIED;
        invoice.fneReference = fneResponse.data.reference;
        invoice.fneToken = fneResponse.data.token;
        invoice.fneCertifiedAt = new Date(fneResponse.data.invoice.createdAt);
        invoice.balanceSticker = fneResponse.data.balance_sticker;
      } else {
        invoice.fneStatus = FneStatus.FAILED;
        throw new BadRequestException(`FNE certification failed: ${fneResponse.error || 'Unknown error'}`);
      }

      await this.invoicesRepository.save(invoice);
      return this.findOne(id);
    } catch (error) {
      invoice.fneStatus = FneStatus.FAILED;
      await this.invoicesRepository.save(invoice);
      throw error;
    }
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.invoicesRepository.count({
      where: {
        invoiceNumber: Like(`${year}-%`),
      },
    });
    return `${year}-${String(count + 1).padStart(4, '0')}`;
  }

}
