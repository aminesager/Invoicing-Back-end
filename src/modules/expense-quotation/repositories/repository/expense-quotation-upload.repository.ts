import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseQuotationUploadEntity } from '../entities/expense-quotation-file.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ExpenseQuotationUploadRepository extends DatabaseAbstractRepository<ExpenseQuotationUploadEntity> {
  constructor(
    @InjectRepository(ExpenseQuotationUploadEntity)
    private readonly expenseQuotationUploadRespository: Repository<ExpenseQuotationUploadEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(expenseQuotationUploadRespository, txHost);
  }
}
