import { Module } from '@nestjs/common';
import { ExpenseQuotationService } from './services/expense-quotation.service';
import { ExpenseQuotationRepositoryModule } from './repositories/expense-quotation.repository.module';
import { CurrencyModule } from '../currency/currency.module';
import { FirmModule } from '../firm/firm.module';
import { InterlocutorModule } from '../interlocutor/Interlocutor.module';
import { ArticleExpenseQuotationEntryService } from './services/article-expense-quotation-entry.service';
import { ArticleExpenseQuotationEntryTaxService } from './services/article-expense-quotation-entry-tax.service';
import { TaxModule } from '../tax/tax.module';
import { ArticleModule } from '../article/article.module';
import { PdfModule } from 'src/common/pdf/pdf.module';
import { CalculationsModule } from 'src/common/calculations/calculations.module';
import { AppConfigModule } from 'src/common/app-config/app-config.module';
// import { ExpenseQuotationSequenceService } from './services/expense-quotation-sequence.service';
import { GatewaysModule } from 'src/common/gateways/gateways.module';
import { ExpenseQuotationMetaDataService } from './services/expense-quotation-meta-data.service';
import { BankAccountModule } from '../bank-account/bank-account.module';
import { StorageModule } from 'src/common/storage/storage.module';
import { ExpenseQuotationUploadService } from './services/expense-quotation-upload.service';
import { ExpenseInvoiceModule } from '../expense-invoice/expense-invoice.module';

@Module({
  controllers: [],
  providers: [
    ExpenseQuotationService,
    ExpenseQuotationMetaDataService,
    ExpenseQuotationUploadService,
    // ExpenseQuotationSequenceService,
    ArticleExpenseQuotationEntryService,
    ArticleExpenseQuotationEntryTaxService,
  ],
  exports: [ExpenseQuotationService],
  imports: [
    //repositories
    ExpenseQuotationRepositoryModule,
    //entities
    ArticleModule,
    AppConfigModule,
    BankAccountModule,
    CurrencyModule,
    FirmModule,
    InterlocutorModule,
    ExpenseInvoiceModule,
    TaxModule,
    //abstract modules
    PdfModule,
    GatewaysModule,
    CalculationsModule,
    StorageModule,
  ],
})
export class ExpenseQuotationModule {}
