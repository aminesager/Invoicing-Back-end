import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseQuotationUploadNotFoundException extends HttpException {
  constructor() {
    super('Expense Quotation upload not found', HttpStatus.NOT_FOUND);
  }
}
