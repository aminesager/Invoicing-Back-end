import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { CabinetEntity } from 'src/modules/cabinet/repositories/entities/cabinet.entity';
import { CurrencyEntity } from 'src/modules/currency/repositories/entities/currency.entity';
import { FirmEntity } from 'src/modules/firm/repositories/entities/firm.entity';
import { InterlocutorEntity } from 'src/modules/interlocutor/repositories/entity/interlocutor.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ArticleExpenseInvoiceEntryEntity } from './article-expense-invoice-entry.entity';
import { BankAccountEntity } from 'src/modules/bank-account/repositories/entities/bank-account.entity';
import { ExpenseInvoiceUploadEntity } from './expense-invoice-file.entity';
import { ExpenseInvoiceMetaDataEntity } from './expense-invoice-meta-data.entity';
import { EXPENSE_INVOICE_STATUS } from '../../enums/expense-invoice-status.enum';
import { ExpenseQuotationEntity } from 'src/modules/expense-quotation/repositories/entities/expense-quotation.entity';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { ExpensePaymentInvoiceEntryEntity } from 'src/modules/expense-payment/repositories/entities/expense-payment-invoice-entry.entity';
import { TaxWithholdingEntity } from 'src/modules/tax-withholding/repositories/entities/tax-withholding.entity';

@Entity('expense-invoice')
export class ExpenseInvoiceEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25 })
  sequential: string;

  @Column({ nullable: true })
  date: Date;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  object: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  generalConditions: string;

  @Column({ type: 'enum', enum: EXPENSE_INVOICE_STATUS, nullable: true })
  status: EXPENSE_INVOICE_STATUS;

  @Column({ nullable: true })
  discount: number;

  @Column({ type: 'enum', enum: DISCOUNT_TYPES, nullable: true })
  discount_type: DISCOUNT_TYPES;

  @Column({ type: 'float', nullable: true })
  subTotal: number;

  @Column({ type: 'float', nullable: true })
  total: number;

  @Column({ type: 'float', nullable: true })
  amountPaid: number;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyId' })
  currency: CurrencyEntity;

  @Column({ type: 'int' })
  currencyId: number;

  @ManyToOne(() => FirmEntity)
  @JoinColumn({ name: 'firmId' })
  firm: FirmEntity;

  @Column({ type: 'int' })
  firmId: number;

  @ManyToOne(() => InterlocutorEntity)
  @JoinColumn({ name: 'interlocutorId' })
  interlocutor: InterlocutorEntity;

  @ManyToOne(() => CabinetEntity)
  @JoinColumn({ name: 'cabinetId' })
  cabinet: CabinetEntity;

  @Column({ type: 'int', default: 1 })
  cabinetId: number;

  @Column({ type: 'int' })
  interlocutorId: number;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  notes: string;

  @OneToMany(
    () => ArticleExpenseInvoiceEntryEntity,
    (entry) => entry.expenseInvoice,
  )
  articleExpenseInvoiceEntries: ArticleExpenseInvoiceEntryEntity[];

  @OneToOne(() => ExpenseInvoiceMetaDataEntity)
  @JoinColumn()
  expenseInvoiceMetaData: ExpenseInvoiceMetaDataEntity;

  @ManyToOne(() => BankAccountEntity)
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: BankAccountEntity;

  @Column({ type: 'int' })
  bankAccountId: number;

  @OneToMany(
    () => ExpenseInvoiceUploadEntity,
    (upload) => upload.expenseInvoice,
  )
  uploads: ExpenseInvoiceUploadEntity[];

  @ManyToOne(() => ExpenseQuotationEntity)
  @JoinColumn({ name: 'expenseQuotationId' })
  expenseQuotation: ExpenseQuotationEntity;

  @Column({ type: 'int', nullable: true })
  expenseQuotationId: number;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxStampId' })
  taxStamp: TaxEntity;

  @Column({ type: 'int' })
  taxStampId: number;

  @OneToMany(
    () => ExpensePaymentInvoiceEntryEntity,
    (entry) => entry.expenseInvoice,
  )
  expensePayments: ExpensePaymentInvoiceEntryEntity[];

  @ManyToOne(() => TaxWithholdingEntity)
  @JoinColumn({ name: 'taxWithholdingId' })
  taxWithholding: TaxWithholdingEntity;

  @Column({ type: 'int', nullable: true })
  taxWithholdingId: number;

  @Column({ type: 'float', nullable: true })
  taxWithholdingAmount: number;
}
