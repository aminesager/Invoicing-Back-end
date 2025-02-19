import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseQuotationUploadDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  uploadId?: number;
}
