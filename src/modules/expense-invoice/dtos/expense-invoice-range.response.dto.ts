import { ApiProperty } from '@nestjs/swagger';
import { ResponseExpenseInvoiceDto } from './expense-invoice.response.dto';

export class ResponseExpenseInvoiceRangeDto {
  @ApiProperty({ type: ResponseExpenseInvoiceDto })
  next: ResponseExpenseInvoiceDto;

  @ApiProperty({ type: ResponseExpenseInvoiceDto })
  previous: ResponseExpenseInvoiceDto;
}
