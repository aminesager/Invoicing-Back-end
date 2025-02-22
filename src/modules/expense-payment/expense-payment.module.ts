import { Module } from '@nestjs/common';
import { ExpensePaymentService } from './services/expense-payment.service';
import { ExpensePaymentUploadService } from './services/expense-payment-upload.service';
import { ExpensePaymentInvoiceEntryService } from './services/expense-payment-invoice-entry.service';
import { PaymentRepositoryModule } from './repositories/expense-payment.repository.module';
import { StorageModule } from 'src/common/storage/storage.module';
import { ExpenseInvoiceModule } from '../expense-invoice/expense-invoice.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  controllers: [],
  providers: [
    ExpensePaymentService,
    ExpensePaymentUploadService,
    ExpensePaymentInvoiceEntryService,
  ],
  exports: [ExpensePaymentService],
  imports: [
    PaymentRepositoryModule,
    CurrencyModule,
    ExpenseInvoiceModule,
    StorageModule,
  ],
})
export class ExpensePaymentModule {}
