import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { ArticleExpenseQuotationEntryEntity } from './article-expense-quotation-entry.entity';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';

@Entity('article-quotation-entry-tax')
export class ArticleExpenseQuotationEntryTaxEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ArticleExpenseQuotationEntryEntity)
  @JoinColumn({ name: 'articleExpenseQuotationEntryId' })
  articleExpenseQuotationEntry: ArticleExpenseQuotationEntryEntity;

  @Column({ type: 'int' })
  articleExpenseQuotationEntryId: number;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxId' })
  tax: TaxEntity;

  @Column({ type: 'int' })
  taxId: number;
}
