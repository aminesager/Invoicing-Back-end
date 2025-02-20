import { ApiProperty } from '@nestjs/swagger';
import { CreateExpensePaymentInvoiceEntryDto } from './expense-payment-invoice-entry.create.dto';

export class UpdateExpensePaymentInvoiceEntryDto extends CreateExpensePaymentInvoiceEntryDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
