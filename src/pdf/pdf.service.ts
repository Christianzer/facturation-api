import { Injectable, NotFoundException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Invoice, PaymentMethod, TemplateFacturation, FneStatus } from '../entities/invoice.entity';
import { CreditNote } from '../entities/credit-note.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { CreditNotesService } from '../credit-notes/credit-notes.service';
import { InvoiceTemplate } from './templates/invoice.template';

@Injectable()
export class PdfService {
  constructor(
    private invoicesService: InvoicesService,
    private creditNotesService: CreditNotesService,
  ) {}

  async generateInvoicePdf(invoiceId: string): Promise<Buffer> {
    const invoice = await this.invoicesService.findOne(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const html = await InvoiceTemplate.generateHtml(invoice);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        printBackground: true
      });
      
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async generateCreditNotePdf(creditNoteId: string): Promise<Buffer> {
    const creditNote = await this.creditNotesService.findOne(creditNoteId);

    if (!creditNote) {
      throw new NotFoundException('Credit note not found');
    }

    const html = this.generateCreditNoteHtml(creditNote);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        printBackground: true
      });
      
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private generateCreditNoteHtml(creditNote: CreditNote): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .credit-note-title {
            font-size: 24px;
            font-weight: bold;
            color: #e74c3c;
            margin-bottom: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .info-section h3 {
            color: #e74c3c;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .totals {
            margin-top: 20px;
            float: right;
            width: 300px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .total-final {
            background: #e74c3c;
            color: white;
            padding: 10px;
            font-weight: bold;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="credit-note-title">AVOIR</div>
    </div>

    <div class="info-grid">
        <div class="info-section">
            <h3>INFORMATIONS AVOIR</h3>
            <div><strong>Numéro:</strong> ${creditNote.creditNoteNumber}</div>
            <div><strong>Date d'émission:</strong> ${new Date(creditNote.issueDate).toLocaleDateString('fr-FR')}</div>
            <div><strong>Statut:</strong> ${this.getCreditNoteStatusText(creditNote.status)}</div>
            ${creditNote.invoice ? `<div><strong>Facture associée:</strong> ${creditNote.invoice.invoiceNumber}</div>` : ''}
        </div>
        
        <div class="info-section">
            <h3>CLIENT</h3>
            <div><strong>${creditNote.customer.name}</strong></div>
            <div>${creditNote.customer.email}</div>
            ${creditNote.customer.address ? `<div>${creditNote.customer.address}</div>` : ''}
            ${creditNote.customer.city && creditNote.customer.postalCode ? `<div>${creditNote.customer.postalCode} ${creditNote.customer.city}</div>` : ''}
        </div>
    </div>

    <div class="info-section" style="margin-bottom: 20px;">
        <h3>MOTIF</h3>
        <p>${creditNote.reason}</p>
    </div>

    <div class="totals">
        <div class="total-row">
            <span>Montant HT:</span>
            <span>${this.formatPrice(Number(creditNote.amount))}</span>
        </div>
        <div class="total-row">
            <span>TVA:</span>
            <span>${this.formatPrice(Number(creditNote.vatAmount))}</span>
        </div>
        <div class="total-row total-final">
            <span>TOTAL TTC:</span>
            <span>${this.formatPrice(Number(creditNote.total))}</span>
        </div>
    </div>

    <div style="clear: both;"></div>

    ${creditNote.notes ? `
    <div class="info-section" style="margin-top: 30px;">
        <h3>NOTES</h3>
        <p>${creditNote.notes}</p>
    </div>
    ` : ''}

    <div style="text-align: center; margin-top: 50px; font-size: 10px; color: #666;">
        <p>Avoir généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        <p>ID: ${creditNote.id}</p>
    </div>
</body>
</html>
    `;
  }

  private formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  }

  private getCreditNoteStatusText(status: string): string {
    const statusMap = {
      draft: 'Brouillon',
      issued: 'Émis',
      applied: 'Appliqué',
      cancelled: 'Annulé',
    };
    return statusMap[status] || status;
  }
}