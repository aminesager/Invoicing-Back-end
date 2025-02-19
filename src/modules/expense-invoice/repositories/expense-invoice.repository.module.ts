import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseInvoiceRepository } from './repository/expense-invoice.repository';
import { ExpenseInvoiceMetaDataRepository } from './repository/expense-invoice-meta-data.repository';
import { ExpenseInvoiceUploadRepository } from './repository/expense-invoice-upload.repository';
import { ArticleExpenseInvoiceEntryRepository } from './repository/article-expense-invoice-entry.repository';
import { ArticleExpenseInvoiceEntryTaxRepository } from './repository/article-expense-invoice-entry-tax.repository';
import { ExpenseInvoiceEntity } from './entities/expense-invoice.entity';
import { ExpenseInvoiceMetaDataEntity } from './entities/expense-invoice-meta-data.entity';
import { ExpenseInvoiceUploadEntity } from './entities/expense-invoice-file.entity';
import { ArticleExpenseInvoiceEntryEntity } from './entities/article-expense-invoice-entry.entity';
import { ArticleExpenseInvoiceEntryTaxEntity } from './entities/article-expense-invoice-entry-tax.entity';

@Module({
  controllers: [],
  providers: [
    ExpenseInvoiceRepository,
    ExpenseInvoiceMetaDataRepository,
    ExpenseInvoiceUploadRepository,
    ArticleExpenseInvoiceEntryRepository,
    ArticleExpenseInvoiceEntryTaxRepository,
  ],
  exports: [
    ExpenseInvoiceRepository,
    ExpenseInvoiceMetaDataRepository,
    ExpenseInvoiceUploadRepository,
    ArticleExpenseInvoiceEntryRepository,
    ArticleExpenseInvoiceEntryTaxRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([ExpenseInvoiceEntity]),
    TypeOrmModule.forFeature([ExpenseInvoiceMetaDataEntity]),
    TypeOrmModule.forFeature([ExpenseInvoiceUploadEntity]),
    TypeOrmModule.forFeature([ArticleExpenseInvoiceEntryEntity]),
    TypeOrmModule.forFeature([ArticleExpenseInvoiceEntryTaxEntity]),
  ],
})
export class InvoiceRepositoryModule {}
