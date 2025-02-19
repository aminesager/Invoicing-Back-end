import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseInvoiceUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
