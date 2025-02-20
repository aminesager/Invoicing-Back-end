import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseQuotationSequentialNotFoundException extends HttpException {
  constructor() {
    super(
      'Cannot get Expense Quotation Sequential Number',
      HttpStatus.NOT_FOUND,
    );
  }
}
