import { Injectable } from '@nestjs/common';
import { ArticleExpenseQuotationEntryEntity } from '../repositories/entities/article-expense-quotation-entry.entity';
import { CreateArticleExpenseQuotationEntryDto } from '../dtos/article-expense-quotation-entry.create.dto';
import { CreateArticleExpenseQuotationEntryTaxDto } from '../dtos/article-expense-quotation-entry-tax.create.dto';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { ArticleService } from 'src/modules/article/services/article.service';
import { ResponseArticleDto } from 'src/modules/article/dtos/article.response.dto';
import { UpdateArticleExpenseQuotationEntryDto } from '../dtos/article-expense-quotation-entry.update.dto';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { ResponseArticleExpenseQuotationEntryDto } from '../dtos/article-expense-quotation-entry.response.dto';
import { ArticleExpenseQuotationEntryRepository } from '../repositories/repository/article-expense-quotation-entry.repository';
import { ArticleExpenseQuotationEntryTaxService } from './article-expense-quotation-entry-tax.service';
import { ArticleExpenseQuotationEntryNotFoundException } from '../errors/article-expense-quotation-entry.notfound.error';
import { LineItem } from 'src/common/calculations/interfaces/line-item.interface';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';
@Injectable()
export class ArticleExpenseQuotationEntryService {
  constructor(
    private readonly articleExpenseQuotationEntryRepository: ArticleExpenseQuotationEntryRepository,
    private readonly articleExpenseQuotationEntryTaxService: ArticleExpenseQuotationEntryTaxService,
    private readonly articleService: ArticleService,
    private readonly taxService: TaxService,
    private readonly calculationsService: InvoicingCalculationsService,
  ) {}

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseArticleExpenseQuotationEntryDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const entry = await this.articleExpenseQuotationEntryRepository.findOne(
      queryOptions as FindOneOptions<ArticleExpenseQuotationEntryEntity>,
    );
    if (!entry) return null;
    return entry;
  }

  async findOneById(
    id: number,
  ): Promise<ResponseArticleExpenseQuotationEntryDto> {
    const entry =
      await this.articleExpenseQuotationEntryRepository.findOneById(id);
    if (!entry) {
      throw new ArticleExpenseQuotationEntryNotFoundException();
    }
    return entry;
  }

  async findOneAsLineItem(id: number): Promise<LineItem> {
    const entry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'articleExpenseQuotationEntryTaxes',
    });
    const taxes = entry.articleExpenseQuotationEntryTaxes
      ? await Promise.all(
          entry.articleExpenseQuotationEntryTaxes.map((taxEntry) =>
            this.taxService.findOneById(taxEntry.taxId),
          ),
        )
      : [];
    return {
      quantity: entry.quantity,
      unit_price: entry.unit_price,
      discount: entry.discount,
      discount_type: entry.discount_type,
      taxes: taxes,
    };
  }

  async findManyAsLineItem(ids: number[]): Promise<LineItem[]> {
    const lineItems = await Promise.all(
      ids.map((id) => this.findOneAsLineItem(id)),
    );
    return lineItems;
  }

  async save(
    createArticleExpenseQuotationEntryDto: CreateArticleExpenseQuotationEntryDto,
  ): Promise<ArticleExpenseQuotationEntryEntity> {
    const taxes = createArticleExpenseQuotationEntryDto.taxes
      ? await Promise.all(
          createArticleExpenseQuotationEntryDto.taxes.map((id) =>
            this.taxService.findOneById(id),
          ),
        )
      : [];

    const article =
      (await this.articleService.findOneByCondition({
        filter: `title||$eq||${createArticleExpenseQuotationEntryDto.article.title}`,
      })) ||
      (await this.articleService.save(
        createArticleExpenseQuotationEntryDto.article,
      ));

    const lineItem = {
      quantity: createArticleExpenseQuotationEntryDto.quantity,
      unit_price: createArticleExpenseQuotationEntryDto.unit_price,
      discount: createArticleExpenseQuotationEntryDto.discount,
      discount_type: createArticleExpenseQuotationEntryDto.discount_type,
      taxes: taxes,
    };

    const entry = await this.articleExpenseQuotationEntryRepository.save({
      ...createArticleExpenseQuotationEntryDto,
      articleId: article.id,
      article: article,
      subTotal: this.calculationsService.calculateSubTotalForLineItem(lineItem),
      total: this.calculationsService.calculateTotalForLineItem(lineItem),
    });

    await this.articleExpenseQuotationEntryTaxService.saveMany(
      taxes.map((tax) => {
        return {
          taxId: tax.id,
          articleExpenseQuotationEntryId: entry.id,
        };
      }),
    );
    return entry;
  }

  async update(
    id: number,
    updateArticleExpenseQuotationEntryDto: UpdateArticleExpenseQuotationEntryDto,
  ): Promise<ArticleExpenseQuotationEntryEntity> {
    // Fetch existing entry
    const existingEntry =
      await this.articleExpenseQuotationEntryRepository.findOneById(id);
    this.articleExpenseQuotationEntryTaxService.softDeleteMany(
      existingEntry.articleExpenseQuotationEntryTaxes.map(
        (taxEntry) => taxEntry.id,
      ),
    );

    // Fetch and check the existence of all taxes
    const taxes = updateArticleExpenseQuotationEntryDto.taxes
      ? await Promise.all(
          updateArticleExpenseQuotationEntryDto.taxes.map((id) =>
            this.taxService.findOneById(id),
          ),
        )
      : [];

    // Delete all existing taxes and rebuild
    for (const taxEntry of existingEntry.articleExpenseQuotationEntryTaxes) {
      this.articleExpenseQuotationEntryTaxService.softDelete(taxEntry.id);
    }

    // Save and check the existence of the article, if a given article doesn't exist by name, it will be created
    let article: ResponseArticleDto;
    try {
      article = await this.articleService.findOneByCondition({
        filter: `title||$eq||${updateArticleExpenseQuotationEntryDto.article.title}`,
      });
    } catch (error) {
      article = await this.articleService.save(
        updateArticleExpenseQuotationEntryDto.article,
      );
    }

    const lineItem = {
      quantity: updateArticleExpenseQuotationEntryDto.quantity,
      unit_price: updateArticleExpenseQuotationEntryDto.unit_price,
      discount: updateArticleExpenseQuotationEntryDto.discount,
      discount_type: updateArticleExpenseQuotationEntryDto.discount_type,
      taxes: taxes,
    };

    // Update the entry with the new data and save it
    const entry = await this.articleExpenseQuotationEntryRepository.save({
      ...existingEntry,
      ...updateArticleExpenseQuotationEntryDto,
      articleId: article.id,
      article: article,
      subTotal: this.calculationsService.calculateSubTotalForLineItem(lineItem),
      total: this.calculationsService.calculateTotalForLineItem(lineItem),
    });

    // Save the new tax entries for the article entry
    await this.articleExpenseQuotationEntryTaxService.saveMany(
      taxes.map((tax) => {
        return {
          taxId: tax.id,
          articleExpenseQuotationEntryId: entry.id,
        };
      }),
    );
    return entry;
  }

  async duplicate(
    id: number,
    quotationId: number,
  ): Promise<ArticleExpenseQuotationEntryEntity> {
    // Fetch the existing entry
    const existingEntry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'articleExpenseQuotationEntryTaxes',
    });

    // Duplicate the taxes associated with this entry
    const duplicatedTaxes = existingEntry.articleExpenseQuotationEntryTaxes.map(
      (taxEntry) => ({
        taxId: taxEntry.taxId,
      }),
    );

    // Create the duplicated entry
    const duplicatedEntry = {
      ...existingEntry,
      quotationId: quotationId,
      id: undefined,
      articleExpenseQuotationEntryTaxes: duplicatedTaxes, // Attach duplicated taxes
      createdAt: undefined,
      updatedAt: undefined,
    };

    // Save the duplicated entry
    const newEntry =
      await this.articleExpenseQuotationEntryRepository.save(duplicatedEntry);

    // Save the new tax entries for the duplicated entry
    await this.articleExpenseQuotationEntryTaxService.saveMany(
      duplicatedTaxes.map((tax) => ({
        taxId: tax.taxId,
        articleExpenseQuotationEntryId: newEntry.id,
      })),
    );

    return newEntry;
  }

  async duplicateMany(
    ids: number[],
    quotationId: number,
  ): Promise<ArticleExpenseQuotationEntryEntity[]> {
    const duplicatedEntries = [];
    for (const id of ids) {
      const duplicatedEntry = await this.duplicate(id, quotationId);
      duplicatedEntries.push(duplicatedEntry);
    }
    return duplicatedEntries;
  }

  async softDelete(id: number): Promise<ArticleExpenseQuotationEntryEntity> {
    const entry =
      await this.articleExpenseQuotationEntryRepository.findByCondition({
        where: { id, deletedAt: null },
        relations: { articleExpenseQuotationEntryTaxes: true },
      });
    await this.articleExpenseQuotationEntryTaxService.softDeleteMany(
      entry.articleExpenseQuotationEntryTaxes.map((taxEntry) => taxEntry.id),
    );
    return this.articleExpenseQuotationEntryRepository.softDelete(id);
  }

  async softDeleteMany(
    ids: number[],
  ): Promise<ArticleExpenseQuotationEntryEntity[]> {
    const entries = await Promise.all(
      ids.map(async (id) => this.softDelete(id)),
    );
    return entries;
  }
}
