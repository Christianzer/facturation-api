import { PartialType } from '@nestjs/swagger';
import { CreateCreditNoteDto } from './create-credit-note.dto';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdateCreditNoteDto extends PartialType(CreateCreditNoteDto) {
  @IsOptional()
  @IsNumber()
  total?: number;
}
