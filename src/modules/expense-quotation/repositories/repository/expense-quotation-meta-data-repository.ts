import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseQuotationMetaDataEntity } from '../entities/expense-quotation-meta-data.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ExpenseQuotationMetaDataRepository extends DatabaseAbstractRepository<ExpenseQuotationMetaDataEntity> {
  constructor(
    @InjectRepository(ExpenseQuotationMetaDataEntity)
    private readonly expenseQuotationMetaDataRespository: Repository<ExpenseQuotationMetaDataEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(expenseQuotationMetaDataRespository, txHost);
  }
}
