import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { ArticleExpenseInvoiceEntryTaxRepository } from '../repositories/repository/article-expense-invoice-entry-tax.repository';
import { ArticleExpenseInvoiceEntryTaxEntity } from '../repositories/entities/article-expense-invoice-entry-tax.entity';
import { CreateArticleExpenseInvoiceEntryTaxDto } from '../dtos/article-expense-invoice-entry-tax.create.dto';

@Injectable()
export class ArticleExpenseInvoiceEntryTaxService {
  constructor(
    private readonly articleExpenseInvoiceEntryTaxRepository: ArticleExpenseInvoiceEntryTaxRepository,
    private readonly taxService: TaxService,
  ) {}

  async save(
    createArticleExpenseInvoiceEntryTaxDto: CreateArticleExpenseInvoiceEntryTaxDto,
  ): Promise<ArticleExpenseInvoiceEntryTaxEntity> {
    const tax = await this.taxService.findOneById(
      createArticleExpenseInvoiceEntryTaxDto.taxId,
    );
    const taxEntry = await this.articleExpenseInvoiceEntryTaxRepository.save({
      articleExpenseInvoiceEntryId:
        createArticleExpenseInvoiceEntryTaxDto.articleExpenseInvoiceEntryId,
      tax,
    });
    return taxEntry;
  }

  async saveMany(
    createArticleExpenseInvoiceEntryTaxDtos: CreateArticleExpenseInvoiceEntryTaxDto[],
  ): Promise<ArticleExpenseInvoiceEntryTaxEntity[]> {
    const savedEntries = [];
    for (const dto of createArticleExpenseInvoiceEntryTaxDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async softDelete(id: number): Promise<void> {
    await this.articleExpenseInvoiceEntryTaxRepository.softDelete(id);
  }

  async softDeleteMany(ids: number[]): Promise<void> {
    ids.forEach(async (id) => await this.softDelete(id));
  }
}
