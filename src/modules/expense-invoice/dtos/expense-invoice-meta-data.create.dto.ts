import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateExpenseInvoiceMetaDataDto {
  // @ApiProperty({ example: true, type: Boolean })
  // @IsBoolean()
  // @IsOptional()
  // showExpenseInvoiceAddress?: boolean;

  // @ApiProperty({ example: true, type: Boolean })
  // @IsBoolean()
  // @IsOptional()
  // showDeliveryAddress?: boolean;

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  showArticleDescription?: boolean;

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  hasBankingDetails?: boolean;

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  hasGeneralConditions?: boolean;

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  hasTaxStamp?: boolean;

  @ApiProperty({ example: true, type: Object })
  @IsOptional()
  taxSummary?: any;

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  hasTaxWithholding: boolean;
}
