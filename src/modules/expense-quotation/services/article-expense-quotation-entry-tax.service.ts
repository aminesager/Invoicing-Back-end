import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { CreateArticleExpenseQuotationEntryTaxDto } from '../dtos/article-expense-quotation-entry-tax.create.dto';
import { ArticleExpenseQuotationEntryTaxEntity } from '../repositories/entities/article-expense-quotation-entry-tax.entity';
import { ArticleExpenseQuotationEntryTaxRepository } from '../repositories/repository/article-expense-quotation-entry-tax.repository';

@Injectable()
export class ArticleExpenseQuotationEntryTaxService {
  constructor(
    private readonly articleExpenseQuotationEntryTaxRepository: ArticleExpenseQuotationEntryTaxRepository,
    private readonly taxService: TaxService,
  ) {}

  async save(
    createArticleExpenseQuotationEntryTaxDto: CreateArticleExpenseQuotationEntryTaxDto,
  ): Promise<ArticleExpenseQuotationEntryTaxEntity> {
    const tax = await this.taxService.findOneById(
      createArticleExpenseQuotationEntryTaxDto.taxId,
    );
    const taxEntry = await this.articleExpenseQuotationEntryTaxRepository.save({
      articleExpenseQuotationEntryId:
        createArticleExpenseQuotationEntryTaxDto.articleExpenseQuotationEntryId,
      tax,
    });
    return taxEntry;
  }

  async saveMany(
    createArticleExpenseQuotationEntryTaxDtos: CreateArticleExpenseQuotationEntryTaxDto[],
  ): Promise<ArticleExpenseQuotationEntryTaxEntity[]> {
    const savedEntries = [];
    for (const dto of createArticleExpenseQuotationEntryTaxDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async softDelete(id: number): Promise<void> {
    await this.articleExpenseQuotationEntryTaxRepository.softDelete(id);
  }

  async softDeleteMany(ids: number[]): Promise<void> {
    ids.forEach(async (id) => await this.softDelete(id));
  }
}
