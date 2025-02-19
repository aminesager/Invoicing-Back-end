import { Module } from '@nestjs/common';
import { ExpenseInvoiceService } from './services/expense-invoice.service';
import { ExpenseInvoiceRepositoryModule } from './repositories/expense-invoice.repository.module';

@Module({
  controllers: [],
  providers: [ExpenseInvoiceService],
  exports: [ExpenseInvoiceService],
  imports: [ExpenseInvoiceRepositoryModule],
})
export class ExpenseInvoiceModule {}
