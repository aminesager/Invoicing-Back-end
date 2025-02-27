import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ExpenseInvoiceEntity } from './expense-invoice.entity';

@Entity('expense-invoice_meta_data')
export class ExpenseInvoiceMetaDataEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => ExpenseInvoiceEntity,
    (expenseInvoice) => expenseInvoice.expenseInvoiceMetaData,
  )
  expenseInvoice: ExpenseInvoiceEntity;

  // @Column({ type: 'boolean', default: true })
  // showExpenseInvoiceAddress: boolean;

  // @Column({ type: 'boolean', default: true })
  // showDeliveryAddress: boolean;

  @Column({ type: 'boolean', default: true })
  showArticleDescription: boolean;

  @Column({ type: 'boolean', default: true })
  hasBankingDetails: boolean;

  @Column({ type: 'boolean', default: true })
  hasGeneralConditions: boolean;

  @Column({ type: 'boolean', default: true })
  hasTaxStamp: boolean;

  @Column({ type: 'boolean', default: true })
  hasTaxWithholding: boolean;

  @Column({ type: 'json', nullable: true })
  taxSummary: any;
}
