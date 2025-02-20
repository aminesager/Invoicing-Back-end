import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EXPENSE_PAYMENT_MODE } from '../../enums/expense-payment-mode.enum';
import { ExpensePaymentUploadEntity } from './expense-payment-file.entity';
import { ExpensePaymentInvoiceEntryEntity } from './expense-payment-invoice-entry.entity';
import { CurrencyEntity } from 'src/modules/currency/repositories/entities/currency.entity';
import { FirmEntity } from 'src/modules/firm/repositories/entities/firm.entity';

@Entity('expense-payment')
export class ExpensePaymentEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', nullable: true })
  amount: number;

  @Column({ type: 'float', nullable: true })
  fee: number;

  @Column({ type: 'float', nullable: true })
  convertionRate: number;

  @Column({ nullable: true })
  date: Date;

  @Column({ type: 'enum', enum: EXPENSE_PAYMENT_MODE, nullable: true })
  mode: EXPENSE_PAYMENT_MODE;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  notes: string;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyId' })
  currency: CurrencyEntity;

  @Column({ type: 'int', nullable: true })
  currencyId: number;

  @OneToMany(
    () => ExpensePaymentUploadEntity,
    (upload) => upload.expensePaymentId,
  )
  uploads: ExpensePaymentUploadEntity[];

  @OneToMany(
    () => ExpensePaymentInvoiceEntryEntity,
    (invoice) => invoice.expensePayment,
  )
  invoices: ExpensePaymentInvoiceEntryEntity[];

  @ManyToOne(() => FirmEntity)
  @JoinColumn({ name: 'firmId' })
  firm: FirmEntity;

  @Column({ type: 'int', nullable: true })
  firmId: number;
}
