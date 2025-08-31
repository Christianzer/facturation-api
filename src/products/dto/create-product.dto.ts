import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Web Development Service' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example:
      'Professional web development service including design and implementation',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 500.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 20.0, default: 20.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  vatRate?: number;

  @ApiPropertyOptional({ example: 'hour' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
