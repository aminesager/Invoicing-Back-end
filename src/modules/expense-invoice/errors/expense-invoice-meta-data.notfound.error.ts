import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseInvoiceMetaDataNotFoundException extends HttpException {
  constructor() {
    super('Expense Invoice Meta Data not found', HttpStatus.NOT_FOUND);
  }
}
