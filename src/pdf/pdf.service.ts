import { Injectable, NotFoundException } from '@nestjs/common';
import { jsPDF } from 'jspdf';
import { Invoice } from '../entities/invoice.entity';
import { CreditNote } from '../entities/credit-note.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { CreditNotesService } from '../credit-notes/credit-notes.service';

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

    const pdf = new jsPDF();
    this.addInvoiceContent(pdf, invoice);

    return Buffer.from(pdf.output('arraybuffer'));
  }

  async generateCreditNotePdf(creditNoteId: string): Promise<Buffer> {
    const creditNote = await this.creditNotesService.findOne(creditNoteId);

    if (!creditNote) {
      throw new NotFoundException('Credit note not found');
    }

    const pdf = new jsPDF();
    this.addCreditNoteContent(pdf, creditNote);

    return Buffer.from(pdf.output('arraybuffer'));
  }

  private addInvoiceContent(pdf: jsPDF, invoice: Invoice): void {
    // Header
    pdf.setFontSize(20);
    pdf.text('FACTURE', 20, 30);

    pdf.setFontSize(12);
    pdf.text(`Numéro: ${invoice.invoiceNumber}`, 20, 45);
    pdf.text(
      `Date d'émission: ${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('fr-FR') : 'Non définie'}`,
      20,
      55,
    );
    pdf.text(
      `Date d'échéance: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : 'Non définie'}`,
      20,
      65,
    );
    pdf.text(`Statut: ${this.getStatusText(invoice.status)}`, 20, 75);

    // Customer Info
    pdf.setFontSize(14);
    pdf.text('Client:', 20, 95);
    pdf.setFontSize(12);
    pdf.text(invoice.customer.name, 20, 105);
    pdf.text(invoice.customer.email, 20, 115);

    if (invoice.customer.address) {
      pdf.text(invoice.customer.address, 20, 125);
    }
    if (invoice.customer.city && invoice.customer.postalCode) {
      pdf.text(
        `${invoice.customer.postalCode} ${invoice.customer.city}`,
        20,
        135,
      );
    }
    if (invoice.customer.vatNumber) {
      pdf.text(`N° TVA: ${invoice.customer.vatNumber}`, 20, 145);
    }

    // Items table header
    let yPosition = 170;
    pdf.setFontSize(12);
    pdf.text('Description', 20, yPosition);
    pdf.text('Qté', 100, yPosition);
    pdf.text('Prix HT', 130, yPosition);
    pdf.text('TVA', 160, yPosition);
    pdf.text('Total TTC', 180, yPosition);

    // Draw line under header
    pdf.line(20, yPosition + 3, 200, yPosition + 3);
    yPosition += 15;

    // Items
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach((item) => {
        pdf.setFontSize(10);
        const description =
          item.description || (item.product ? item.product.name : 'Service');
        pdf.text(description, 20, yPosition);
        pdf.text(item.quantity.toString(), 100, yPosition);
        pdf.text(`${Number(item.unitPrice).toFixed(2)}FCFA`, 130, yPosition);
        pdf.text(`${Number(item.vatRate).toFixed(1)}%`, 160, yPosition);
        pdf.text(`${Number(item.total).toFixed(2)}FCFA`, 180, yPosition);
        yPosition += 12;
      });
    }

    // Totals
    yPosition += 10;
    pdf.line(20, yPosition, 200, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.text('Sous-total HT:', 130, yPosition);
    pdf.text(`${Number(invoice.subtotal).toFixed(2)}FCFA`, 180, yPosition);
    yPosition += 12;

    pdf.text('TVA:', 130, yPosition);
    pdf.text(`${Number(invoice.vatAmount).toFixed(2)}FCFA`, 180, yPosition);
    yPosition += 12;

    pdf.setFontSize(14);
    pdf.text('Total TTC:', 130, yPosition);
    pdf.text(`${Number(invoice.total).toFixed(2)}FCFA`, 180, yPosition);

    // Notes
    if (invoice.notes) {
      yPosition += 25;
      pdf.setFontSize(12);
      pdf.text('Notes:', 20, yPosition);
      yPosition += 10;
      pdf.setFontSize(10);
      const splitNotes = pdf.splitTextToSize(invoice.notes, 170);
      pdf.text(splitNotes, 20, yPosition);
    }

    // Payment terms
    if (invoice.paymentTerms) {
      yPosition += invoice.notes ? 20 : 25;
      pdf.setFontSize(12);
      pdf.text('Conditions de paiement:', 20, yPosition);
      yPosition += 10;
      pdf.setFontSize(10);
      const splitTerms = pdf.splitTextToSize(invoice.paymentTerms, 170);
      pdf.text(splitTerms, 20, yPosition);
    }
  }

  private addCreditNoteContent(pdf: jsPDF, creditNote: CreditNote): void {
    // Header
    pdf.setFontSize(20);
    pdf.text('AVOIR', 20, 30);

    pdf.setFontSize(12);
    pdf.text(`Numéro: ${creditNote.creditNoteNumber}`, 20, 45);
    pdf.text(
      `Date d'émission: ${new Date(creditNote.issueDate).toLocaleDateString('fr-FR')}`,
      20,
      55,
    );
    pdf.text(
      `Statut: ${this.getCreditNoteStatusText(creditNote.status)}`,
      20,
      65,
    );

    // Customer Info
    pdf.setFontSize(14);
    pdf.text('Client:', 20, 85);
    pdf.setFontSize(12);
    pdf.text(creditNote.customer.name, 20, 95);
    pdf.text(creditNote.customer.email, 20, 105);

    if (creditNote.customer.address) {
      pdf.text(creditNote.customer.address, 20, 115);
    }
    if (creditNote.customer.city && creditNote.customer.postalCode) {
      pdf.text(
        `${creditNote.customer.postalCode} ${creditNote.customer.city}`,
        20,
        125,
      );
    }

    // Invoice reference
    if (creditNote.invoice) {
      pdf.text(
        `Facture associée: ${creditNote.invoice.invoiceNumber}`,
        20,
        145,
      );
    }

    // Reason
    pdf.setFontSize(14);
    pdf.text('Motif:', 20, 165);
    pdf.setFontSize(12);
    const splitReason = pdf.splitTextToSize(creditNote.reason, 170);
    pdf.text(splitReason, 20, 175);

    // Amounts
    let yPosition = 200;
    pdf.setFontSize(12);
    pdf.text('Montant HT:', 130, yPosition);
    pdf.text(`${Number(creditNote.amount).toFixed(2)}FCFA`, 180, yPosition);
    yPosition += 12;

    pdf.text('TVA:', 130, yPosition);
    pdf.text(`${Number(creditNote.vatAmount).toFixed(2)}FCFA`, 180, yPosition);
    yPosition += 12;

    pdf.setFontSize(14);
    pdf.text('Total TTC:', 130, yPosition);
    pdf.text(`${Number(creditNote.total).toFixed(2)}FCFA`, 180, yPosition);

    // Notes
    if (creditNote.notes) {
      yPosition += 25;
      pdf.setFontSize(12);
      pdf.text('Notes:', 20, yPosition);
      yPosition += 10;
      pdf.setFontSize(10);
      const splitNotes = pdf.splitTextToSize(creditNote.notes, 170);
      pdf.text(splitNotes, 20, yPosition);
    }
  }

  private getStatusText(status: string): string {
    const statusMap = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
    };
    return statusMap[status] || status;
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
