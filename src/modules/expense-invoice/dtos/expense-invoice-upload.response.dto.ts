import { ApiProperty } from '@nestjs/swagger';

export class ResponseExpenseInvoiceUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  expenseInvoiceId?: number;

  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
