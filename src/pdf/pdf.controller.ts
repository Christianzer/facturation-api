import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('PDF Generation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @ApiOperation({ summary: 'Generate PDF for invoice' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @Get('invoice/:id')
  async generateInvoicePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.pdfService.generateInvoicePdf(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      });

      res.send(pdfBuffer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate PDF',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Generate PDF for credit note' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  @ApiResponse({ status: 404, description: 'Credit note not found' })
  @Get('credit-note/:id')
  async generateCreditNotePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.pdfService.generateCreditNotePdf(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="avoir-${id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      });

      res.send(pdfBuffer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate PDF',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Preview PDF for invoice in browser' })
  @ApiResponse({
    status: 200,
    description: 'PDF preview generated successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @Get('invoice/:id/preview')
  async previewInvoicePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.pdfService.generateInvoicePdf(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
      });

      res.send(pdfBuffer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate PDF preview',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Preview PDF for credit note in browser' })
  @ApiResponse({
    status: 200,
    description: 'PDF preview generated successfully',
  })
  @ApiResponse({ status: 404, description: 'Credit note not found' })
  @Get('credit-note/:id/preview')
  async previewCreditNotePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.pdfService.generateCreditNotePdf(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
      });

      res.send(pdfBuffer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate PDF preview',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
