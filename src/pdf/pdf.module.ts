import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { InvoicesModule } from '../invoices/invoices.module';
import { CreditNotesModule } from '../credit-notes/credit-notes.module';

@Module({
  imports: [InvoicesModule, CreditNotesModule],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
