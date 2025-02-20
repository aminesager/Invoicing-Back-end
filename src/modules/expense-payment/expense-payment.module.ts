import { Module } from '@nestjs/common';
import { PaymentService } from './services/expense-payment.service';
import { PaymentUploadService } from './services/expense-payment-upload.service';
import { PaymentInvoiceEntryService } from './services/expense-payment-invoice-entry.service';
import { PaymentRepositoryModule } from './repositories/expense-payment.repository.module';
import { StorageModule } from 'src/common/storage/storage.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  controllers: [],
  providers: [PaymentService, PaymentUploadService, PaymentInvoiceEntryService],
  exports: [PaymentService],
  imports: [
    PaymentRepositoryModule,
    CurrencyModule,
    InvoiceModule,
    StorageModule,
  ],
})
export class PaymentModule {}
