import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('buy-quotation')
export class BuyQuotationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 25 })
  name: string;
}
