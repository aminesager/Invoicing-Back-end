import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateExpenseInvoiceDto } from './expense-invoice.create.dto';
import { UpdateExpenseInvoiceUploadDto } from './expense-invoice-upload.update.dto';

export class UpdateExpenseInvoiceDto extends CreateExpenseInvoiceDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateExpenseInvoiceUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  amountPaid: number;
}
