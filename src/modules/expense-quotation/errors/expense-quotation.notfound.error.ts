import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseQuotationNotFoundException extends HttpException {
  constructor() {
    super('Expense Quotation not found', HttpStatus.NOT_FOUND);
  }
}
