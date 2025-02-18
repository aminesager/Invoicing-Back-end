import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ExpenseQuotationEntity } from './expense-quotation.entity';

@Entity('expense-quotation_meta_data')
export class QuotationMetaDataEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => ExpenseQuotationEntity,
    (quotation) => quotation.quotationMetaData,
  )
  expense_quotation: ExpenseQuotationEntity;

  @Column({ type: 'boolean', default: true })
  showInvoiceAddress: boolean;

  @Column({ type: 'boolean', default: true })
  showDeliveryAddress: boolean;

  @Column({ type: 'boolean', default: true })
  showArticleDescription: boolean;

  @Column({ type: 'boolean', default: true })
  hasBankingDetails: boolean;

  @Column({ type: 'boolean', default: true })
  hasGeneralConditions: boolean;

  @Column({ type: 'json', nullable: true })
  taxSummary: any;
}
