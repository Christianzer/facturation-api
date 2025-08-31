import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus } from '../../entities/invoice.entity';

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.SENT })
  @IsEnum(InvoiceStatus)
  @IsNotEmpty()
  status: InvoiceStatus;
}
