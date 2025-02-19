import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExpenseInvoiceService } from '../services/expense-invoice.service';
import { CreateExpenseInvoiceDto } from '../dtos/expense-invoice.create.dto';

@ApiTags('expense-invoice')
@Controller({
  version: '1',
  path: '/expense-invoice',
})
export class ExpenseInvoiceController {
  constructor(private readonly expenseInvoiceService: ExpenseInvoiceService) {}

  @Post()
  async create(@Body() createExpenseInvoiceDto: CreateExpenseInvoiceDto) {
    return this.expenseInvoiceService.create(createExpenseInvoiceDto);
  }

  @Get()
  async findAll() {
    return this.expenseInvoiceService.findAll();
  }
}
