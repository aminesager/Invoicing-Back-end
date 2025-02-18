import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseInvoiceEntity } from './entities/expense-invoice.entity';
import { ExpenseInvoiceRepository } from './repository/expense-invoice.repository';

@Module({
  controllers: [],
  providers: [ExpenseInvoiceRepository],
  exports: [ExpenseInvoiceRepository],
  imports: [TypeOrmModule.forFeature([ExpenseInvoiceEntity])],
})
export class ExpenseInvoiceRepositoryModule {}
