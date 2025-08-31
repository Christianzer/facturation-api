import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { Invoice } from '../entities/invoice.entity';

export interface FneCertifyRequest {
  invoiceType: string;
  paymentMethod: string;
  template: string;
  clientNcc: string;
  clientCompanyName: string;
  clientPhone: string;
  clientEmail: string;
  pointOfSale: string;
  establishment: string;
  items: FneItem[];
  discount: number;
}

export interface FneItem {
  taxes: string[];
  reference: string;
  description: string;
  quantity: number;
  amount: number;
  discount: number;
  measurementUnit: string;
}

export interface FneCertifyResponse {
  success: boolean;
  data?: {
    ncc: string;
    reference: string;
    token: string;
    warning: boolean;
    balance_sticker: number;
    invoice: {
      id: string;
      reference: string;
      amount: number;
      vatAmount: number;
      currency: string;
      qrCode: string;
      createdAt: string;
      status: string;
    };
  };
  statusCode: number;
  timestamp: string;
  error?: string;
}

@Injectable()
export class FneService {
  private readonly logger = new Logger(FneService.name);
  private readonly fneApiUrl: string;

  constructor(private configService: ConfigService) {
    this.fneApiUrl = this.configService.get('FNE_API_URL') || 'https://api.fne.example.com';
  }

  async certifyInvoice(invoice: Invoice): Promise<FneCertifyResponse> {
    try {
      const request = this.buildCertifyRequest(invoice);

      const response: AxiosResponse<FneCertifyResponse> = await axios.post(
        `${this.fneApiUrl}/api/fne/certify/invoice`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      this.logger.log(`FNE certification successful for invoice ${invoice.invoiceNumber}`);
      this.logger.log(`FNE certification successful for response ${response.data}`);
      this.logger.log(`FNE certification successful for response v2 ${response}`);
      return response.data;
    } catch (error) {
      this.logger.error(`FNE certification failed for invoice ${invoice.invoiceNumber}:`, error.message);

      if (axios.isAxiosError(error) && error.response) {
        throw new BadRequestException(`FNE API Error: ${error.response.data?.message || error.message}`);
      }

      throw new BadRequestException(`FNE certification failed: ${error.message}`);
    }
  }

  private buildCertifyRequest(invoice: Invoice): FneCertifyRequest {
    const paymentMethodMap = {
      'cash': 'cash',
      'mobile-money': 'mobile-money',
      'card': 'card',
      'chek': 'chek',
      'transfert': 'transfert',
      'deferred': 'deferred',
    };

    const templateMap = {
      'B2C': 'B2C',
      'B2B': 'B2B', 
      'B2G': 'B2G',
      'B2F': 'B2F',
    };

    const getTvaCode = (vatRate: number): string => {
      switch (vatRate) {
        case 18:
          return 'TVA';
        case 9:
          return 'TVAB';
        case 0:
          return 'TVAC';
        default:
          return 'TVA';
      }
    };

    const items: FneItem[] = invoice.items?.map(item => ({
      taxes: [getTvaCode(Number(item.vatRate))],
      reference: item.product?.id || 'CUSTOM',
      description: item.description || item.product?.name || 'Service',
      quantity: item.quantity,
      amount: Number(item.unitPrice) * 100,
      discount: 0,
      measurementUnit: 'pièce',
    })) || [];

    return {
      invoiceType: 'sale',
      paymentMethod: invoice.paymentMethod ? paymentMethodMap[invoice.paymentMethod] || 'cash' : 'cash',
      template: templateMap[invoice.templateFacturation] || 'B2C',
      clientNcc: invoice.customer.siret || invoice.customer.vatNumber || '',
      clientCompanyName: invoice.customer.name,
      clientPhone: invoice.customer.phone || '',
      clientEmail: invoice.customer.email,
      pointOfSale: 'Point de vente principal',
      establishment: 'Établissement principal',
      items,
      discount: 0,
    };
  }
}