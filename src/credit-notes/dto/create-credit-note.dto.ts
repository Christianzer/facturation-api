import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCreditNoteDto {
  @ApiProperty({ example: 'uuid-customer-id' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional({ example: 'uuid-invoice-id' })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @ApiProperty({ example: 500.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 100.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  vatAmount: number;

  @ApiProperty({ example: 'Product return' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ example: 'Additional notes about the credit note' })
  @IsOptional()
  @IsString()
  notes?: string;
}
