import { DATE_FORMAT } from 'src/app/enums/date-formats.enum';

export interface ExpenseQuotationSequence {
  prefix: string;
  dynamicSequence: DATE_FORMAT;
  next: number;
}
