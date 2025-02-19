import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseQuotationEntity } from '../entities/expense-quotation.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ExpenseQuotationRepository extends DatabaseAbstractRepository<ExpenseQuotationEntity> {
  constructor(
    @InjectRepository(ExpenseQuotationEntity)
    private readonly expenseQuotationRepository: Repository<ExpenseQuotationEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(expenseQuotationRepository, txHost);
  }
}
