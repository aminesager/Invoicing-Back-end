import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ExpenseQuotationEntity } from './expense-quotation.entity';

@Entity('expense-quotation_meta_data')
export class ExpenseQuotationMetaDataEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => ExpenseQuotationEntity,
    (expenseQuotation) => expenseQuotation.expenseQuotationMetaData,
  )
  expenseQuotation: ExpenseQuotationEntity;

  @Column({ type: 'boolean', default: true })
  showArticleDescription: boolean;

  @Column({ type: 'boolean', default: true })
  hasBankingDetails: boolean;

  @Column({ type: 'boolean', default: true })
  hasGeneralConditions: boolean;

  @Column({ type: 'json', nullable: true })
  taxSummary: any;
}
