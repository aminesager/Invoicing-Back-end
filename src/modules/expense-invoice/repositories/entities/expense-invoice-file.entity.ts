import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';
import { ExpenseInvoiceEntity } from './expense-invoice.entity';

@Entity('expense-invoice-upload')
export class ExpenseInvoiceUploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExpenseInvoiceEntity)
  @JoinColumn({ name: 'expenseInvoiceId' })
  expenseInvoice: ExpenseInvoiceEntity;

  @Column({ type: 'int' })
  expenseInvoiceId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;
}
