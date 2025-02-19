import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseInvoiceSequentialNotFoundException extends HttpException {
  constructor() {
    super('Cannot get Expense Invoice Sequential Number', HttpStatus.NOT_FOUND);
  }
}
