import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { TaxEntity } from 'src/modules/tax/repositories/entities/tax.entity';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { ArticleExpenseInvoiceEntryEntity } from './article-expense-invoice-entry.entity';

@Entity('article-expense-invoice-entry-tax')
export class ArticleExpenseInvoiceEntryTaxEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => ArticleExpenseInvoiceEntryEntity)
  @JoinColumn({ name: 'articleExpenseInvoiceEntryId' })
  articleExpenseInvoiceEntry: ArticleExpenseInvoiceEntryEntity;

  @Column({ type: 'int' })
  articleExpenseInvoiceEntryId: number;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'taxId' })
  tax: TaxEntity;

  @Column({ type: 'int' })
  taxId: number;
}
