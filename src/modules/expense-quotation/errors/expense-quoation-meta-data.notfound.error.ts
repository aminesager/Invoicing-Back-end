import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseQuotationMetaDataNotFoundException extends HttpException {
  constructor() {
    super('Expense Quotation Meta Data not found', HttpStatus.NOT_FOUND);
  }
}
