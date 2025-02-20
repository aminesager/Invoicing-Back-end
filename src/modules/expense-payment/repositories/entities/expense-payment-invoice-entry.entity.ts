import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExpensePaymentEntity } from './expense-payment.entity';
import { InvoiceEntity } from 'src/modules/invoice/repositories/entities/invoice.entity';

@Entity('expense-payment-invoice_entry')
export class ExpensePaymentInvoiceEntryEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExpensePaymentEntity)
  @JoinColumn({ name: 'expensePaymentId' })
  expensePayment: ExpensePaymentEntity;

  @Column({ type: 'int' })
  expensePaymentId: number;

  @ManyToOne(() => InvoiceEntity)
  @JoinColumn({ name: 'invoiceId' })
  invoice: InvoiceEntity;

  @Column({ type: 'int' })
  invoiceId: number;

  @Column({ type: 'float', nullable: true })
  amount: number;
}
