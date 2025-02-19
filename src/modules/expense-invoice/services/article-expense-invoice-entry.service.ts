import { Injectable } from '@nestjs/common';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { ArticleService } from 'src/modules/article/services/article.service';
import { ResponseArticleDto } from 'src/modules/article/dtos/article.response.dto';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { LineItem } from 'src/common/calculations/interfaces/line-item.interface';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';
import { ArticleExpenseInvoiceEntryRepository } from '../repositories/repository/article-expense-invoice-entry.repository';
import { ArticleExpenseInvoiceEntryTaxService } from './article-expense-invoice-entry-tax.service';
import { ResponseArticleExpenseInvoiceEntryDto } from '../dtos/article-expense-invoice-entry.response.dto';
import { ArticleExpenseInvoiceEntryEntity } from '../repositories/entities/article-expense-invoice-entry.entity';
import { ArticleExpenseInvoiceEntryNotFoundException } from '../errors/article-expense-invoice-entry.notfound.error';
import { CreateArticleExpenseInvoiceEntryDto } from '../dtos/article-expense-invoice-entry.create.dto';
import { UpdateArticleExpenseInvoiceEntryDto } from '../dtos/article-expense-invoice-entry.update.dto';

@Injectable()
export class ArticleExpenseInvoiceEntryService {
  constructor(
    private readonly articleExpenseInvoiceEntryRepository: ArticleExpenseInvoiceEntryRepository,
    private readonly articleExpenseInvoiceEntryTaxService: ArticleExpenseInvoiceEntryTaxService,
    private readonly articleService: ArticleService,
    private readonly taxService: TaxService,
    private readonly calculationsService: InvoicingCalculationsService,
  ) {}

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseArticleExpenseInvoiceEntryDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const entry = await this.articleExpenseInvoiceEntryRepository.findOne(
      queryOptions as FindOneOptions<ArticleExpenseInvoiceEntryEntity>,
    );
    if (!entry) return null;
    return entry;
  }

  async findOneById(
    id: number,
  ): Promise<ResponseArticleExpenseInvoiceEntryDto> {
    const entry =
      await this.articleExpenseInvoiceEntryRepository.findOneById(id);
    if (!entry) {
      throw new ArticleExpenseInvoiceEntryNotFoundException();
    }
    return entry;
  }

  async findOneAsLineItem(id: number): Promise<LineItem> {
    const entry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'articleExpenseInvoiceEntryTaxes',
    });
    const taxes = entry.articleExpenseInvoiceEntryTaxes
      ? await Promise.all(
          entry.articleExpenseInvoiceEntryTaxes.map((taxEntry) =>
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
    createArticleExpenseInvoiceEntryDto: CreateArticleExpenseInvoiceEntryDto,
  ): Promise<ArticleExpenseInvoiceEntryEntity> {
    const taxes = createArticleExpenseInvoiceEntryDto.taxes
      ? await Promise.all(
          createArticleExpenseInvoiceEntryDto.taxes.map((id) =>
            this.taxService.findOneById(id),
          ),
        )
      : [];

    const article =
      (await this.articleService.findOneByCondition({
        filter: `title||$eq||${createArticleExpenseInvoiceEntryDto.article.title}`,
      })) ||
      (await this.articleService.save(
        createArticleExpenseInvoiceEntryDto.article,
      ));

    const lineItem = {
      quantity: createArticleExpenseInvoiceEntryDto.quantity,
      unit_price: createArticleExpenseInvoiceEntryDto.unit_price,
      discount: createArticleExpenseInvoiceEntryDto.discount,
      discount_type: createArticleExpenseInvoiceEntryDto.discount_type,
      taxes: taxes,
    };

    const entry = await this.articleExpenseInvoiceEntryRepository.save({
      ...createArticleExpenseInvoiceEntryDto,
      articleId: article.id,
      article: article,
      subTotal: this.calculationsService.calculateSubTotalForLineItem(lineItem),
      total: this.calculationsService.calculateTotalForLineItem(lineItem),
    });

    await this.articleExpenseInvoiceEntryTaxService.saveMany(
      taxes.map((tax) => {
        return {
          taxId: tax.id,
          articleExpenseInvoiceEntryId: entry.id,
        };
      }),
    );
    return entry;
  }

  async saveMany(
    createArticleExpenseInvoiceEntryDtos: CreateArticleExpenseInvoiceEntryDto[],
  ): Promise<ArticleExpenseInvoiceEntryEntity[]> {
    const savedEntries = [];
    for (const dto of createArticleExpenseInvoiceEntryDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  async update(
    id: number,
    updateArticleExpenseInvoiceEntryDto: UpdateArticleExpenseInvoiceEntryDto,
  ): Promise<ArticleExpenseInvoiceEntryEntity> {
    //fetch exisiting entry
    const existingEntry =
      await this.articleExpenseInvoiceEntryRepository.findOneById(id);
    this.articleExpenseInvoiceEntryTaxService.softDeleteMany(
      existingEntry.articleExpenseInvoiceEntryTaxes.map(
        (taxEntry) => taxEntry.id,
      ),
    );

    //fetch and check the existance of all taxes
    const taxes = updateArticleExpenseInvoiceEntryDto.taxes
      ? await Promise.all(
          updateArticleExpenseInvoiceEntryDto.taxes.map((id) =>
            this.taxService.findOneById(id),
          ),
        )
      : [];

    //delete all existing taxes and rebuild
    for (const taxEntry of existingEntry.articleExpenseInvoiceEntryTaxes) {
      this.articleExpenseInvoiceEntryTaxService.softDelete(taxEntry.id);
    }

    //save and check of articles existance , if a given article doesn't exist by name , it will be created
    let article: ResponseArticleDto;
    try {
      article = await this.articleService.findOneByCondition({
        filter: `title||$eq||${updateArticleExpenseInvoiceEntryDto.article.title}`,
      });
    } catch (error) {
      article = await this.articleService.save(
        updateArticleExpenseInvoiceEntryDto.article,
      );
    }

    const lineItem = {
      quantity: updateArticleExpenseInvoiceEntryDto.quantity,
      unit_price: updateArticleExpenseInvoiceEntryDto.unit_price,
      discount: updateArticleExpenseInvoiceEntryDto.discount,
      discount_type: updateArticleExpenseInvoiceEntryDto.discount_type,
      taxes: taxes,
    };

    //update the entry with the new data and save it
    const entry = await this.articleExpenseInvoiceEntryRepository.save({
      ...existingEntry,
      ...updateArticleExpenseInvoiceEntryDto,
      articleId: article.id,
      article: article,
      subTotal: this.calculationsService.calculateSubTotalForLineItem(lineItem),
      total: this.calculationsService.calculateTotalForLineItem(lineItem),
    });
    //save the new tax entries for the article entry
    await this.articleExpenseInvoiceEntryTaxService.saveMany(
      taxes.map((tax) => {
        return {
          taxId: tax.id,
          articleExpenseInvoiceEntryId: entry.id,
        };
      }),
    );
    return entry;
  }

  async duplicate(
    id: number,
    expenseInvoiceId: number,
  ): Promise<ArticleExpenseInvoiceEntryEntity> {
    // Fetch the existing entry
    const existingEntry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'articleInvoiceEntryTaxes',
    });

    // Duplicate the taxes associated with this entry
    const duplicatedTaxes = existingEntry.articleExpenseInvoiceEntryTaxes.map(
      (taxEntry) => ({
        taxId: taxEntry.taxId,
      }),
    );

    // Create the duplicated entry
    const duplicatedEntry = {
      ...existingEntry,
      expenseInvoiceId: expenseInvoiceId,
      id: undefined,
      articleExpenseInvoiceEntryTaxes: duplicatedTaxes, // Attach duplicated taxes
      createdAt: undefined,
      updatedAt: undefined,
    };

    // Save the duplicated entry
    const newEntry =
      await this.articleExpenseInvoiceEntryRepository.save(duplicatedEntry);

    // Save the new tax entries for the duplicated entry
    await this.articleExpenseInvoiceEntryTaxService.saveMany(
      duplicatedTaxes.map((tax) => ({
        taxId: tax.taxId,
        articleExpenseInvoiceEntryId: newEntry.id,
      })),
    );

    return newEntry;
  }

  async duplicateMany(
    ids: number[],
    expenseInvoiceId: number,
  ): Promise<ArticleExpenseInvoiceEntryEntity[]> {
    const duplicatedEntries = [];
    for (const id of ids) {
      const duplicatedEntry = await this.duplicate(id, expenseInvoiceId);
      duplicatedEntries.push(duplicatedEntry);
    }
    return duplicatedEntries;
  }

  async softDelete(id: number): Promise<ArticleExpenseInvoiceEntryEntity> {
    const entry =
      await this.articleExpenseInvoiceEntryRepository.findByCondition({
        where: { id, deletedAt: null },
        relations: { articleExpenseInvoiceEntryTaxes: true },
      });
    await this.articleExpenseInvoiceEntryTaxService.softDeleteMany(
      entry.articleExpenseInvoiceEntryTaxes.map((taxEntry) => taxEntry.id),
    );
    return this.articleExpenseInvoiceEntryRepository.softDelete(id);
  }

  async softDeleteMany(
    ids: number[],
  ): Promise<ArticleExpenseInvoiceEntryEntity[]> {
    const entries = await Promise.all(
      ids.map(async (id) => this.softDelete(id)),
    );
    return entries;
  }
}
