import { HttpException, HttpStatus } from '@nestjs/common';

export class ArticleExpenseQuotationEntryNotFoundException extends HttpException {
  constructor() {
    super('Article Expense Quotation Entry not found', HttpStatus.NOT_FOUND);
  }
}
