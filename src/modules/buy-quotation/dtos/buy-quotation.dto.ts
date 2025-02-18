import { IsString, MaxLength } from 'class-validator';

export class BuyQuotationDto {
  @IsString()
  @MaxLength(25)
  name: string;
}
