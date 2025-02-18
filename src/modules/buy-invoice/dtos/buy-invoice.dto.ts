import { IsString, MaxLength } from 'class-validator';

export class BuyInvoiceDto {
  @IsString()
  @MaxLength(25)
  name: string;
}
