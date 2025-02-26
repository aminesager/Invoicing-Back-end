import { DATE_FORMAT } from 'src/app/enums/date-formats.enum';

export interface ExpenseInvoiceSequence {
  prefix: string;
  dynamicSequence: DATE_FORMAT;
  next: number;
}
