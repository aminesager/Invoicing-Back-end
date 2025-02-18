import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('expense-invoice')
export class ExpenseInvoiceEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;
}
