import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleExpenseQuotationEntryEntity } from '../entities/article-expense-quotation-entry.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ArticleExpenseQuotationEntryRepository extends DatabaseAbstractRepository<ArticleExpenseQuotationEntryEntity> {
  constructor(
    @InjectRepository(ArticleExpenseQuotationEntryEntity)
    private readonly articleExpenseQuotationEntryRepository: Repository<ArticleExpenseQuotationEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleExpenseQuotationEntryRepository, txHost);
  }
}
