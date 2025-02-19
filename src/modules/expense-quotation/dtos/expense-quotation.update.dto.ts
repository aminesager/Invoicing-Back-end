import { ApiProperty } from '@nestjs/swagger';
import { UpdateExpenseQuotationUploadDto } from './expense-quotation-upload.update.dto';
import { IsOptional } from 'class-validator';
import { CreateExpenseQuotationDto } from './expense-quotation.create.dto';

export class UpdateExpenseQuotationDto extends CreateExpenseQuotationDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: UpdateExpenseQuotationUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  createInvoice: boolean;
}
