import { Injectable } from '@nestjs/common';
import { CreateExpenseInvoiceDto } from '../dtos/expense-invoice.create.dto';
import { ExpenseInvoiceRepository } from '../repositories/repository/expense-invoice.repository';

@Injectable()
export class ExpenseInvoiceService {
  constructor(
    private readonly expenseInvoiceRepository: ExpenseInvoiceRepository,
  ) {}

  async create(createExpenseInvoiceDto: CreateExpenseInvoiceDto) {
    return this.expenseInvoiceRepository.create(createExpenseInvoiceDto);
  }

  async findAll() {
    return this.expenseInvoiceRepository.findAll();
  }
}
