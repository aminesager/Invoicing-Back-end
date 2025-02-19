import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseQuotationEntity } from './entities/expense-quotation.entity';
import { ExpenseQuotationRepository } from './repository/expense-quotation.repository';
import { ArticleExpenseQuotationEntryRepository } from './repository/article-expense-quotation-entry.repository';
import { ArticleExpenseQuotationEntryEntity } from './entities/article-expense-quotation-entry.entity';
import { ArticleExpenseQuotationEntryTaxRepository } from './repository/article-expense-quotation-entry-tax.repository';
import { ArticleExpenseQuotationEntryTaxEntity } from './entities/article-expense-quotation-entry-tax.entity';
import { ExpenseQuotationMetaDataRepository } from './repository/expense-quotation-meta-data-repository';
import { ExpenseQuotationMetaDataEntity } from './entities/expense-quotation-meta-data.entity';
import { ExpenseQuotationUploadRepository } from './repository/expense-quotation-upload.repository';
import { ExpenseQuotationUploadEntity } from './entities/expense-quotation-file.entity';

@Module({
  controllers: [],
  providers: [
    ExpenseQuotationRepository,
    ExpenseQuotationMetaDataRepository,
    ExpenseQuotationUploadRepository,
    ArticleExpenseQuotationEntryRepository,
    ArticleExpenseQuotationEntryTaxRepository,
  ],
  exports: [
    ExpenseQuotationRepository,
    ExpenseQuotationMetaDataRepository,
    ExpenseQuotationUploadRepository,
    ArticleExpenseQuotationEntryRepository,
    ArticleExpenseQuotationEntryTaxRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([ExpenseQuotationEntity]),
    TypeOrmModule.forFeature([ExpenseQuotationMetaDataEntity]),
    TypeOrmModule.forFeature([ExpenseQuotationUploadEntity]),
    TypeOrmModule.forFeature([ArticleExpenseQuotationEntryEntity]),
    TypeOrmModule.forFeature([ArticleExpenseQuotationEntryTaxEntity]),
  ],
})
export class ExpenseQuotationRepositoryModule {}
