import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('buy-quotation')
export class BuyQuotationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;
}
