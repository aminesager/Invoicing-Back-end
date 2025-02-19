import { Injectable } from '@nestjs/common';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ArticleExpenseInvoiceEntryTaxEntity } from '../entities/article-expense-invoice-entry-tax.entity';

@Injectable()
export class ArticleExpenseInvoiceEntryTaxRepository extends DatabaseAbstractRepository<ArticleExpenseInvoiceEntryTaxEntity> {
  constructor(
    @InjectRepository(ArticleExpenseInvoiceEntryTaxEntity)
    private readonly articleExpenseInvoiceEntryTaxRepository: Repository<ArticleExpenseInvoiceEntryTaxEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(articleExpenseInvoiceEntryTaxRepository, txHost);
  }
}
