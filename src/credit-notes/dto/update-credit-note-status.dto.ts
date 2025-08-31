import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreditNoteStatus } from '../../entities/credit-note.entity';

export class UpdateCreditNoteStatusDto {
  @ApiProperty({ enum: CreditNoteStatus, example: CreditNoteStatus.ISSUED })
  @IsEnum(CreditNoteStatus)
  @IsNotEmpty()
  status: CreditNoteStatus;
}
