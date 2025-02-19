import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class DuplicateExpenseInvoiceDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  includeFiles?: boolean;
}
