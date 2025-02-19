import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleExpenseQuotationEntryTaxEntity } from '../entities/article-expense-quotation-entry-tax.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ArticleExpenseQuotationEntryTaxRepository extends DatabaseAbstractRepository<ArticleExpenseQuotationEntryTaxEntity> {
  constructor(
    @InjectRepository(ArticleExpenseQuotationEntryTaxEntity)
    private readonly articleExpenseQuotationEntryTaxRepository: Repository<ArticleExpenseQuotationEntryTaxEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleExpenseQuotationEntryTaxRepository, txHost);
  }
}
