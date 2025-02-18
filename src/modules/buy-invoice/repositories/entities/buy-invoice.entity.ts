import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('buy-invoice')
export class BuyInvoiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;
}
