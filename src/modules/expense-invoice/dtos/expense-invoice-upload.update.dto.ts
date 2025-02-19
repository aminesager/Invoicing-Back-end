import { ApiProperty } from '@nestjs/swagger';
import { CreateExpenseInvoiceUploadDto } from './expense-invoice-upload.create.dto';

export class UpdateExpenseInvoiceUploadDto extends CreateExpenseInvoiceUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
