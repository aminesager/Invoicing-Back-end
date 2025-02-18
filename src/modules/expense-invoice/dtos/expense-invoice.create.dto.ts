import { IsString, MaxLength } from 'class-validator';

export class CreateExpenseInvoiceDto {
  @IsString()
  @MaxLength(25)
  label: string;
}
