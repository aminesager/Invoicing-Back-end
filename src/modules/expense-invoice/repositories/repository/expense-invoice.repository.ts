import { Repository } from 'typeorm';
import { DatabaseAbstractRepository } from 'src/common/database/utils/database.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ExpenseInvoiceEntity } from '../entities/expense-invoice.entity';

@Injectable()
export class ExpenseInvoiceRepository extends DatabaseAbstractRepository<ExpenseInvoiceEntity> {
  constructor(
    @InjectRepository(ExpenseInvoiceEntity)
    private readonly expenseInvoiceRepository: Repository<ExpenseInvoiceEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(expenseInvoiceRepository, txHost);
  }
}
