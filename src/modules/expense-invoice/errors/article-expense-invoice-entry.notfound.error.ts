import { HttpException, HttpStatus } from '@nestjs/common';

export class ArticleExpenseInvoiceEntryNotFoundException extends HttpException {
  constructor() {
    super('Article Expense Invoice Entry not found', HttpStatus.NOT_FOUND);
  }
}
