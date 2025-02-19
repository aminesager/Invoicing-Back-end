import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ArticleExpenseInvoiceEntryEntity } from '../entities/article-expense-invoice-entry.entity';

@Injectable()
export class ArticleExpenseInvoiceEntryRepository extends DatabaseAbstractRepository<ArticleExpenseInvoiceEntryEntity> {
  constructor(
    @InjectRepository(ArticleExpenseInvoiceEntryEntity)
    private readonly articleExpenseInvoiceEntryRepository: Repository<ArticleExpenseInvoiceEntryEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleExpenseInvoiceEntryRepository, txHost);
  }
}
