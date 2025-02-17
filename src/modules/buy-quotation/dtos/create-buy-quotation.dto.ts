import { IsString, MaxLength } from 'class-validator';

export class CreateBuyQuotationDto {
  @IsString()
  @MaxLength(25)
  name: string;
}
