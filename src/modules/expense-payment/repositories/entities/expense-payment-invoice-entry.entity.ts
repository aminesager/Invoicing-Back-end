import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExpensePaymentEntity } from './expense-payment.entity';
import { ExpenseInvoiceEntity } from 'src/modules/expense-invoice/repositories/entities/expense-invoice.entity';

@Entity('expense-payment-invoice_entry')
export class ExpensePaymentInvoiceEntryEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExpensePaymentEntity)
  @JoinColumn({ name: 'expensePaymentId' })
  expensePayment: ExpensePaymentEntity;

  @Column({ type: 'int' })
  expensePaymentId: number;

  @ManyToOne(() => ExpenseInvoiceEntity)
  @JoinColumn({ name: 'expenseInvoiceId' })
  expenseInvoice: ExpenseInvoiceEntity;

  @Column({ type: 'int' })
  expenseInvoiceId: number;

  @Column({ type: 'float', nullable: true })
  amount: number;
}
