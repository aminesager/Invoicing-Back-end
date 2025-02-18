import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { ExpenseQuotationEntity } from './expense-quotation.entity';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';

@Entity('expense-quotation-upload')
export class QuotationUploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExpenseQuotationEntity)
  @JoinColumn({ name: 'expense-quotationId' })
  expensequotation: ExpenseQuotationEntity;

  @Column({ type: 'int' })
  expenseQuotationId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;
}
