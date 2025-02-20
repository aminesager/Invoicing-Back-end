import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { ArticleExpenseQuotationEntryTaxEntity } from '../repositories/entities/article-expense-quotation-entry-tax.entity';
import { CreateArticleExpenseQuotationEntryTaxDto } from '../dtos/article-expense-quotation-entry-tax.response.dto';
import { ArticleExpenseQuotationEntryTaxRepository } from '../repositories/repository/article-expense-quotation-entry-tax.repository';

@Injectable()
export class ArticleExpenseQuotationEntryTaxService {
  constructor(
    private readonly articleQuotationEntryTaxRepository: ArticleExpenseQuotationEntryTaxRepository,
    private readonly taxService: TaxService,
  ) {}

  async save(
    createArticleQuotationEntryTaxDto: CreateArticleExpenseQuotationEntryTaxDto,
  ): Promise<ArticleExpenseQuotationEntryTaxEntity> {
    const tax = await this.taxService.findOneById(
      createArticleQuotationEntryTaxDto.taxId,
    );
    const taxEntry = await this.articleQuotationEntryTaxRepository.save({
      articleExpenseQuotationEntryId:
        createArticleQuotationEntryTaxDto.articleExpenseQuotationEntryId,
      tax,
    });
    return taxEntry;
  }

  async saveMany(
    createArticleQuotationEntryTaxDtos: CreateArticleExpenseQuotationEntryTaxDto[],
  ): Promise<ArticleExpenseQuotationEntryTaxEntity[]> {
    const savedEntries = [];
    for (const dto of createArticleQuotationEntryTaxDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async softDelete(id: number): Promise<void> {
    await this.articleQuotationEntryTaxRepository.softDelete(id);
  }

  async softDeleteMany(ids: number[]): Promise<void> {
    ids.forEach(async (id) => await this.softDelete(id));
  }
}
