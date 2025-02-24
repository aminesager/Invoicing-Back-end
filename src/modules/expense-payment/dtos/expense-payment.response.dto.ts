import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { EXPENSE_PAYMENT_MODE } from '../enums/expense-payment-mode.enum';
import { ResponseExpensePaymentUploadDto } from './expense-payment-upload.response.dto';
import { ResponseExpensePaymentInvoiceEntryDto } from './expense-payment-invoice-entry.response.dto';

export class ResponseExpensePaymentDto {
  @ApiProperty({ example: 1, type: Number })
  id?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  amount?: number;

  @ApiProperty({
    example: '15.0',
    type: Number,
  })
  fee?: number;

  @ApiProperty({
    example: '150.0',
    type: Number,
  })
  convertionRate?: number;

  @ApiProperty({ example: faker.date.anytime(), type: Date })
  date?: Date;

  @ApiProperty({
    example: EXPENSE_PAYMENT_MODE.Cash,
    enum: EXPENSE_PAYMENT_MODE,
  })
  mode?: EXPENSE_PAYMENT_MODE;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  notes?: string;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  currencyId?: number;

  @ApiProperty({ required: false })
  uploads?: ResponseExpensePaymentUploadDto[];

  @ApiProperty({ required: false })
  expenseInvoices?: ResponseExpensePaymentInvoiceEntryDto[];
}
