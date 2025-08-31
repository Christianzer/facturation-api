import { Invoice } from '../../entities/invoice.entity';
import * as QRCode from 'qrcode';

export class InvoiceTemplate {
  private static formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  }

  static async generateHtml(invoice: Invoice): Promise<string> {
    const isFneCertified = invoice.fneStatus === 'certified' && !!invoice.fneReference;
    let qrCodeDataUrl = '';
    
    // Generate QR code if FNE token exists
    if (invoice.fneToken) {
      try {
        qrCodeDataUrl = await QRCode.toDataURL(invoice.fneToken, {
          width: 200,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
      } catch (error) {
        console.error('QR Code generation error:', error);
      }
    }

    const paymentMethodText = this.getPaymentMethodText(invoice.paymentMethod);
    const templateText = this.getTemplateText(invoice.templateFacturation);
    const statusText = this.getStatusText(invoice.status);
    const fneStatusText = this.getFneStatusText(invoice.fneStatus);

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
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .fne-certified {
            background: #e8f5e8;
            border: 2px solid #4CAF50;
            padding: 10px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .fne-header {
            color: #4CAF50;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .info-section h3 {
            color: #4CAF50;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th {
            background: #4CAF50;
            color: white;
            padding: 10px 5px;
            text-align: left;
            font-size: 11px;
        }
        .items-table td {
            padding: 8px 5px;
            border-bottom: 1px solid #ddd;
            font-size: 10px;
        }
        .items-table tr:nth-child(even) {
            background: #f9f9f9;
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
            background: #4CAF50;
            color: white;
            padding: 10px;
            font-weight: bold;
            font-size: 14px;
        }
        .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border: 1px solid #4CAF50;
            border-radius: 5px;
        }
        .notes-section {
            margin-top: 30px;
            clear: both;
        }
        .notes-section h3 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="invoice-title">${isFneCertified ? 'FACTURE NORMALISÉE ÉLECTRONIQUE' : 'FACTURE'}</div>
    </div>

    ${isFneCertified ? `
    <div class="fne-certified">
        <div class="fne-header">✓ FACTURE CERTIFIÉE FNE</div>
        <div><strong>Référence:</strong> ${invoice.fneReference || 'N/A'}</div>
        <div><strong>Certifiée le:</strong> ${invoice.fneCertifiedAt ? new Date(invoice.fneCertifiedAt).toLocaleDateString('fr-FR') : 'N/A'}</div>
        ${invoice.balanceSticker ? `<div><strong>Balance Sticker:</strong> ${invoice.balanceSticker}</div>` : ''}
    </div>
    ` : ''}

    <div class="invoice-info">
        <div class="info-section">
            <h3>INFORMATIONS FACTURE</h3>
            <div><strong>Numéro:</strong> ${invoice.invoiceNumber}</div>
            <div><strong>Date d'émission:</strong> ${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('fr-FR') : 'Non définie'}</div>
            <div><strong>Date d'échéance:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : 'Non définie'}</div>
            <div><strong>Statut:</strong> ${statusText}</div>
            <div><strong>Type:</strong> ${templateText}</div>
            ${invoice.paymentMethod ? `<div><strong>Paiement:</strong> ${paymentMethodText}</div>` : ''}
            ${invoice.fneStatus !== 'draft' ? `<div><strong>Statut FNE:</strong> ${fneStatusText}</div>` : ''}
        </div>
        
        <div class="info-section">
            <h3>CLIENT</h3>
            <div><strong>${invoice.customer.name}</strong></div>
            <div>${invoice.customer.email}</div>
            ${invoice.customer.phone ? `<div>Tél: ${invoice.customer.phone}</div>` : ''}
            ${invoice.customer.address ? `<div>${invoice.customer.address}</div>` : ''}
            ${invoice.customer.city && invoice.customer.postalCode ? `<div>${invoice.customer.postalCode} ${invoice.customer.city}</div>` : ''}
            ${invoice.customer.vatNumber ? `<div>N° TVA: ${invoice.customer.vatNumber}</div>` : ''}
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 40%;">Description</th>
                <th style="width: 10%;">Qté</th>
                <th style="width: 15%;">Prix HT</th>
                <th style="width: 10%;">TVA</th>
                <th style="width: 15%;">Sous-total</th>
                <th style="width: 15%;">Total TTC</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.items?.map(item => `
                <tr>
                    <td>${item.description || (item.product ? item.product.name : 'Service')}</td>
                    <td>${item.quantity}</td>
                    <td>${this.formatPrice(Number(item.unitPrice))}</td>
                    <td>${Number(item.vatRate).toFixed(1)}%</td>
                    <td>${this.formatPrice(Number(item.subtotal))}</td>
                    <td>${this.formatPrice(Number(item.total))}</td>
                </tr>
            `).join('') || '<tr><td colspan="6">Aucun article</td></tr>'}
        </tbody>
    </table>

    <div class="totals">
        <div class="total-row">
            <span>Sous-total HT:</span>
            <span>${this.formatPrice(Number(invoice.subtotal))}</span>
        </div>
        <div class="total-row">
            <span>TVA:</span>
            <span>${this.formatPrice(Number(invoice.vatAmount))}</span>
        </div>
        <div class="total-row total-final">
            <span>TOTAL TTC:</span>
            <span>${this.formatPrice(Number(invoice.total))}</span>
        </div>
    </div>

    <div style="clear: both;"></div>

    ${qrCodeDataUrl && isFneCertified ? `
    <div class="qr-section">
        <h3 style="color: #4CAF50; margin-bottom: 15px;">Code de vérification FNE</h3>
        <img src="${qrCodeDataUrl}" alt="QR Code FNE" style="width: 150px; height: 150px;">
        <div style="margin-top: 10px; font-size: 10px;">
            <div><strong>Token:</strong> ${invoice.fneToken?.substring(0, 50)}...</div>
        </div>
    </div>
    ` : ''}

    ${invoice.notes ? `
    <div class="notes-section">
        <h3>Notes</h3>
        <p>${invoice.notes}</p>
    </div>
    ` : ''}

    ${invoice.paymentTerms ? `
    <div class="notes-section">
        <h3>Conditions de paiement</h3>
        <p>${invoice.paymentTerms}</p>
    </div>
    ` : ''}

    <div class="footer">
        <p>Facture générée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        <p>ID: ${invoice.id}</p>
    </div>
</body>
</html>
    `;
  }

  private static getStatusText(status: string): string {
    const statusMap = {
      draft: 'Brouillon',
      sent: 'Envoyée', 
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
    };
    return statusMap[status] || status;
  }

  private static getPaymentMethodText(method: string | null): string {
    if (!method) return 'Non défini';
    const methodMap = {
      cash: 'Espèces',
      'mobile-money': 'Mobile Money',
      card: 'Carte bancaire',
      chek: 'Chèque',
      transfert: 'Virement bancaire',
      deferred: 'À terme',
    };
    return methodMap[method] || method;
  }

  private static getTemplateText(template: string): string {
    const templateMap = {
      B2C: 'Vente à un particulier',
      B2B: 'Vente à une entreprise', 
      B2G: 'Vente à l\'administration',
      B2F: 'Vente à l\'étranger',
    };
    return templateMap[template] || template;
  }

  private static getFneStatusText(status: string): string {
    const statusMap = {
      draft: 'Brouillon',
      certified: 'Certifiée',
      failed: 'Échec',
    };
    return statusMap[status] || status;
  }
}