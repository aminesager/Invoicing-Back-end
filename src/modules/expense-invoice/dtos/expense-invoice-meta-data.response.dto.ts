import { ApiProperty } from '@nestjs/swagger';

export class ResponseExpenseInvoiceMetaDataDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  // @ApiProperty({ example: true, type: Boolean })
  // showExpenseInvoiceAddress: boolean;

  // @ApiProperty({ example: true, type: Boolean })
  // showDeliveryAddress: boolean;

  @ApiProperty({ example: true, type: Boolean })
  showArticleDescription: boolean;

  @ApiProperty({ example: true, type: Boolean })
  hasBankingDetails?: boolean;

  @ApiProperty({ example: true, type: Boolean })
  hasGeneralConditions?: boolean;

  @ApiProperty({ example: true, type: Boolean })
  hasTaxStamp?: boolean;

  @ApiProperty({ example: {}, type: Object })
  taxSummary: any;

  @ApiProperty({ example: true, type: Boolean })
  hasTaxWithholding: boolean;
}
