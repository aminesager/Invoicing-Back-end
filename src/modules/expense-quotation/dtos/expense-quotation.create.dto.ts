import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { DISCOUNT_TYPES } from 'src/app/enums/discount-types.enum';
import { CreateArticleExpenseQuotationEntryDto } from './article-expense-quotation-entry.create.dto';
import { EXPENSE_QUOTATION_STATUS } from '../enums/expense-quotation-status.enum';
import { CreateExpenseQuotationMetaDataDto } from './expense-quotation-meta-data.create.dto';
import { CreateExpenseQuotationUploadDto } from './expense-quotation-upload.create.dto';

export class CreateExpenseQuotationDto {
  @ApiProperty({ example: faker.date.anytime() })
  date?: Date;

  @ApiProperty({ example: faker.date.anytime() })
  dueDate?: Date;

  @ApiProperty({
    example: faker.finance.transactionDescription(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  object?: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  sequential?: string;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  generalConditions?: string;

  @ApiProperty({
    example: EXPENSE_QUOTATION_STATUS.Draft,
    enum: EXPENSE_QUOTATION_STATUS,
  })
  @IsOptional()
  @IsEnum(EXPENSE_QUOTATION_STATUS)
  status?: EXPENSE_QUOTATION_STATUS;

  @ApiProperty({
    example: '0.1',
    type: Number,
  })
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: DISCOUNT_TYPES.PERCENTAGE, enum: DISCOUNT_TYPES })
  @IsOptional()
  @IsEnum(DISCOUNT_TYPES)
  discount_type?: DISCOUNT_TYPES;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  currencyId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  bankAccountId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  firmId?: number;

  @ApiProperty({
    example: '1',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  interlocutorId?: number;

  @ApiProperty({
    example: faker.hacker.phrase(),
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  notes?: string;

  @ApiProperty({
    type: () => CreateArticleExpenseQuotationEntryDto,
    isArray: true,
  })
  @IsOptional()
  articleExpenseQuotationEntries?: CreateArticleExpenseQuotationEntryDto[];

  @ApiProperty({ type: () => CreateExpenseQuotationMetaDataDto })
  @IsOptional()
  expenseQuotationMetaData?: CreateExpenseQuotationMetaDataDto;

  @ApiProperty({ required: false })
  @IsOptional()
  uploads?: CreateExpenseQuotationUploadDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  expenseInvoiceId?: number;
}
