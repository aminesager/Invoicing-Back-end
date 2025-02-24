import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { EXPENSE_PAYMENT_MODE } from '../enums/expense-payment-mode.enum';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { CreateExpensePaymentUploadDto } from './expense-payment-upload.create.dto';
import { CreateExpensePaymentInvoiceEntryDto } from './expense-payment-invoice-entry.create.dto';

export class CreateExpensePaymentDto {
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
  @IsPositive()
  convertionRate?: number;

  @ApiProperty({ example: faker.date.anytime(), type: Date })
  date?: Date;

  @ApiProperty({
    example: EXPENSE_PAYMENT_MODE.Cash,
    enum: EXPENSE_PAYMENT_MODE,
  })
  @IsEnum(EXPENSE_PAYMENT_MODE)
  @IsOptional()
  mode?: EXPENSE_PAYMENT_MODE;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  notes?: string;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  currencyId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: CreateExpensePaymentUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  expenseInvoices?: CreateExpensePaymentInvoiceEntryDto[];
}
