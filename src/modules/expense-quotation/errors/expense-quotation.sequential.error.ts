import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseQuotationSequentialNotFoundException extends HttpException {
  constructor() {
    super(
      'Expense Cannot get Quotation Sequential Number',
      HttpStatus.NOT_FOUND,
    );
  }
}
