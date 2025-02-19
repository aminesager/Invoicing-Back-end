import { ApiProperty } from '@nestjs/swagger';
import { CreateExpenseQuotationUploadDto } from './expense-quotation-upload.create.dto';

export class UpdateExpenseQuotationUploadDto extends CreateExpenseQuotationUploadDto {
  @ApiProperty({ example: 1, type: Number })
  id: number;
}
