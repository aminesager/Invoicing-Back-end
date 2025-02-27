import { Injectable, StreamableFile } from '@nestjs/common';
import { ExpenseQuotationRepository } from '../repositories/repository/expense-quotation.repository';
import { ExpenseQuotationEntity } from '../repositories/entities/expense-quotation.entity';
import { ExpenseQuotationNotFoundException } from '../errors/expense-quotation.notfound.error';
import { ResponseExpenseQuotationDto } from '../dtos/expense-quotation.response.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { CreateExpenseQuotationDto } from '../dtos/expense-quotation.create.dto';
import { UpdateExpenseQuotationDto } from '../dtos/expense-quotation.update.dto';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { FirmService } from 'src/modules/firm/services/firm.service';
import { InterlocutorService } from 'src/modules/interlocutor/services/interlocutor.service';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { ArticleExpenseQuotationEntryService } from './article-expense-quotation-entry.service';
import { ArticleExpenseQuotationEntryEntity } from '../repositories/entities/article-expense-quotation-entry.entity';
import { PdfService } from 'src/common/pdf/services/pdf.service';
import { format, isAfter } from 'date-fns';
import { ExpenseQuotationSequenceService } from './expense-quotation-sequence.service';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { ExpenseQuotationMetaDataService } from './expense-quotation-meta-data.service';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { BankAccountService } from 'src/modules/bank-account/services/bank-account.service';
import { ExpenseQuotationUploadService } from './expense-quotation-upload.service';
import { ResponseExpenseQuotationUploadDto } from '../dtos/expense-quotation-upload.response.dto';
import { ExpenseQuotationSequence } from '../interfaces/expense-quotation-sequence.interface';
import { UpdateExpenseQuotationSequenceDto } from '../dtos/expense-quotation-seqence.update.dto';
import { Transactional } from '@nestjs-cls/transactional';
import { DuplicateExpenseQuotationDto } from '../dtos/expense-quotation.duplicate.dto';
import { EXPENSE_QUOTATION_STATUS } from '../enums/expense-quotation-status.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ExpenseQuotationService {
  constructor(
    //repositories
    private readonly expenseQuotationRepository: ExpenseQuotationRepository,
    //entity services
    private readonly articleExpenseQuotationEntryService: ArticleExpenseQuotationEntryService,
    private readonly expenseQuotationUploadService: ExpenseQuotationUploadService,
    private readonly bankAccountService: BankAccountService,
    private readonly currencyService: CurrencyService,
    private readonly firmService: FirmService,
    private readonly interlocutorService: InterlocutorService,
    private readonly expenseQuotationSequenceService: ExpenseQuotationSequenceService,
    private readonly expenseQuotationMetaDataService: ExpenseQuotationMetaDataService,
    private readonly taxService: TaxService,

    //abstract services
    private readonly calculationsService: InvoicingCalculationsService,
    private readonly pdfService: PdfService,
  ) {}

  async downloadPdf(id: number, template: string): Promise<StreamableFile> {
    const expenseQuotation = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: new String().concat(
        'firm,',
        'cabinet,',
        'currency,',
        'bankAccount,',
        'interlocutor,',
        'cabinet.address,',
        'expenseQuotationMetaData,',
        'articleExpenseQuotationEntries,',
        'articleExpenseQuotationEntries.article,',
        'articleExpenseQuotationEntries.articleExpenseQuotationEntryTaxes,',
        'articleExpenseQuotationEntries.articleExpenseQuotationEntryTaxes.tax',
      ),
    });
    const digitsAferComma = expenseQuotation.currency.digitAfterComma;
    if (expenseQuotation) {
      const data = {
        meta: {
          ...expenseQuotation.expenseQuotationMetaData,
          type: 'DEVIS',
        },
        expenseQuotation: {
          ...expenseQuotation,
          date: format(expenseQuotation.date, 'dd/MM/yyyy'),
          dueDate: format(expenseQuotation.dueDate, 'dd/MM/yyyy'),
          taxSummary: expenseQuotation.expenseQuotationMetaData.taxSummary,
          subTotal: expenseQuotation.subTotal.toFixed(digitsAferComma),
          total: expenseQuotation.total.toFixed(digitsAferComma),
        },
      };

      const pdfBuffer = await this.pdfService.generatePdf(data, template);
      return new StreamableFile(pdfBuffer);
    } else {
      throw new ExpenseQuotationNotFoundException();
    }
  }

  async findOneById(id: number): Promise<ExpenseQuotationEntity> {
    const expenseQuotation =
      await this.expenseQuotationRepository.findOneById(id);
    if (!expenseQuotation) {
      throw new ExpenseQuotationNotFoundException();
    }
    return expenseQuotation;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ExpenseQuotationEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const expenseQuotation = await this.expenseQuotationRepository.findOne(
      queryOptions as FindOneOptions<ExpenseQuotationEntity>,
    );
    if (!expenseQuotation) return null;
    return expenseQuotation;
  }

  async findAll(query: IQueryObject = {}): Promise<ExpenseQuotationEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.expenseQuotationRepository.findAll(
      queryOptions as FindManyOptions<ExpenseQuotationEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseExpenseQuotationDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.expenseQuotationRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.expenseQuotationRepository.findAll(
      queryOptions as FindManyOptions<ExpenseQuotationEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: parseInt(query.page),
        take: parseInt(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  @Transactional()
  async save(
    createExpenseQuotationDto: CreateExpenseQuotationDto,
  ): Promise<ExpenseQuotationEntity> {
    // Parallelize fetching firm, bank account, and currency, as they are independent
    const [firm, bankAccount, currency] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${createExpenseQuotationDto.firmId}`,
      }),
      createExpenseQuotationDto.bankAccountId
        ? this.bankAccountService.findOneById(
            createExpenseQuotationDto.bankAccountId,
          )
        : Promise.resolve(null),
      createExpenseQuotationDto.currencyId
        ? this.currencyService.findOneById(createExpenseQuotationDto.currencyId)
        : Promise.resolve(null),
    ]);

    if (!firm) {
      throw new Error('Firm not found'); // Handle firm not existing
    }

    // Check interlocutor existence
    await this.interlocutorService.findOneById(
      createExpenseQuotationDto.interlocutorId,
    );

    // Save article entries if provided
    const articleEntries =
      createExpenseQuotationDto.articleExpenseQuotationEntries &&
      (await this.articleExpenseQuotationEntryService.saveMany(
        createExpenseQuotationDto.articleExpenseQuotationEntries,
      ));

    if (!articleEntries) {
      throw new Error('Article entries are missing');
    }

    // Calculate financial information
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        createExpenseQuotationDto.discount,
        createExpenseQuotationDto.discount_type,
      );

    // Format articleEntries as lineItems for tax calculations
    const lineItems =
      await this.articleExpenseQuotationEntryService.findManyAsLineItem(
        articleEntries.map((entry) => entry.id),
      );

    // Calculate tax summary and fetch tax details in parallel
    const taxSummary = await Promise.all(
      this.calculationsService
        .calculateTaxSummary(lineItems)
        .map(async (item) => {
          const tax = await this.taxService.findOneById(item.taxId);

          return {
            ...item,
            label: tax.label,
            // If the tax is a rate (percentage), multiply by 100 for percentage display,
            // otherwise use the fixed amount directly.
            value: tax.isRate ? tax.value * 100 : tax.value,
            isRate: tax.isRate, // You can also return this flag for further use.
          };
        }),
    );

    // Fetch the latest sequential number for quotation
    const sequential =
      await this.expenseQuotationSequenceService.getSequential();

    // Save quotation metadata
    const expenseQuotationMetaData =
      await this.expenseQuotationMetaDataService.save({
        ...createExpenseQuotationDto.expenseQuotationMetaData,
        taxSummary,
      });

    // Save the quotation entity
    const expenseQuotation = await this.expenseQuotationRepository.save({
      ...createExpenseQuotationDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      sequential,
      articleExpenseQuotationEntries: articleEntries,
      expenseQuotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
    });

    // Handle file uploads if they exist
    if (createExpenseQuotationDto.uploads) {
      await Promise.all(
        createExpenseQuotationDto.uploads.map((u) =>
          this.expenseQuotationUploadService.save(
            expenseQuotation.id,
            u.uploadId,
          ),
        ),
      );
    }

    return expenseQuotation;
  }

  async saveMany(
    createExpenseQuotationDtos: CreateExpenseQuotationDto[],
  ): Promise<ExpenseQuotationEntity[]> {
    const expenseQuotations = [];
    for (const createExpenseQuotationDto of createExpenseQuotationDtos) {
      const expenseQuotation = await this.save(createExpenseQuotationDto);
      expenseQuotations.push(expenseQuotation);
    }
    return expenseQuotations;
  }

  async updateExpenseQuotationUploads(
    id: number,
    updateExpenseQuotationDto: UpdateExpenseQuotationDto,
    existingUploads: ResponseExpenseQuotationUploadDto[],
  ) {
    const newUploads = [];
    const keptUploads = [];
    const eliminatedUploads = [];

    if (updateExpenseQuotationDto.uploads) {
      for (const upload of existingUploads) {
        const exists = updateExpenseQuotationDto.uploads.some(
          (u) => u.id === upload.id,
        );
        if (!exists)
          eliminatedUploads.push(
            await this.expenseQuotationUploadService.softDelete(upload.id),
          );
        else keptUploads.push(upload);
      }
      for (const upload of updateExpenseQuotationDto.uploads) {
        if (!upload.id)
          newUploads.push(
            await this.expenseQuotationUploadService.save(id, upload.uploadId),
          );
      }
    }
    return {
      keptUploads,
      newUploads,
      eliminatedUploads,
    };
  }

  @Transactional()
  async update(
    id: number,
    updateExpenseQuotationDto: UpdateExpenseQuotationDto,
  ): Promise<ExpenseQuotationEntity> {
    // Retrieve the existing quotation with necessary relations
    const { uploads: existingUploads, ...existingExpenseQuotation } =
      await this.findOneByCondition({
        filter: `id||$eq||${id}`,
        join: 'articleExpenseQuotationEntries,expenseQuotationMetaData,uploads',
      });

    // Fetch and validate related entities in parallel to optimize performance
    const [firm, bankAccount, currency, interlocutor] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${updateExpenseQuotationDto.firmId}`,
      }),
      updateExpenseQuotationDto.bankAccountId
        ? this.bankAccountService.findOneById(
            updateExpenseQuotationDto.bankAccountId,
          )
        : null,
      updateExpenseQuotationDto.currencyId
        ? this.currencyService.findOneById(updateExpenseQuotationDto.currencyId)
        : null,
      updateExpenseQuotationDto.interlocutorId
        ? this.interlocutorService.findOneById(
            updateExpenseQuotationDto.interlocutorId,
          )
        : null,
    ]);

    // Soft delete old article entries to prepare for new ones
    const existingArticles =
      await this.articleExpenseQuotationEntryService.softDeleteMany(
        existingExpenseQuotation.articleExpenseQuotationEntries.map(
          (entry) => entry.id,
        ),
      );

    // Save new article entries
    const articleEntries: ArticleExpenseQuotationEntryEntity[] =
      updateExpenseQuotationDto.articleExpenseQuotationEntries
        ? await this.articleExpenseQuotationEntryService.saveMany(
            updateExpenseQuotationDto.articleExpenseQuotationEntries,
          )
        : existingArticles;

    // Calculate the subtotal and total for the new entries
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        updateExpenseQuotationDto.discount,
        updateExpenseQuotationDto.discount_type,
      );

    // Convert article entries to line items for further calculations
    const lineItems =
      await this.articleExpenseQuotationEntryService.findManyAsLineItem(
        articleEntries.map((entry) => entry.id),
      );

    // Calculate tax summary (handle both percentage and fixed taxes)
    const taxSummary = await Promise.all(
      this.calculationsService
        .calculateTaxSummary(lineItems)
        .map(async (item) => {
          const tax = await this.taxService.findOneById(item.taxId);

          return {
            ...item,
            label: tax.label,
            // Check if the tax is rate-based or a fixed amount
            rate: tax.isRate ? tax.value * 100 : tax.value, // handle both types
            isRate: tax.isRate,
          };
        }),
    );

    // Save or update the quotation metadata with the updated tax summary
    const expenseQuotationMetaData =
      await this.expenseQuotationMetaDataService.save({
        ...existingExpenseQuotation.expenseQuotationMetaData,
        ...updateExpenseQuotationDto.expenseQuotationMetaData,
        taxSummary,
      });

    // Handle uploads - manage existing, new, and eliminated uploads
    const { keptUploads, newUploads, eliminatedUploads } =
      await this.updateExpenseQuotationUploads(
        existingExpenseQuotation.id,
        updateExpenseQuotationDto,
        existingUploads,
      );

    // Save and return the updated quotation with all updated details
    return this.expenseQuotationRepository.save({
      ...updateExpenseQuotationDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      interlocutorId: interlocutor ? interlocutor.id : null,
      articleExpenseQuotationEntries: articleEntries,
      expenseQuotationMetaData,
      subTotal,
      total: totalAfterGeneralDiscount,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
    });
  }

  async duplicate(
    duplicateExpenseQuotationDto: DuplicateExpenseQuotationDto,
  ): Promise<ResponseExpenseQuotationDto> {
    const existingExpenseQuotation = await this.findOneByCondition({
      filter: `id||$eq||${duplicateExpenseQuotationDto.id}`,
      join: new String().concat(
        'expenseQuotationMetaData,',
        'articleExpenseQuotationEntries,',
        'articleExpenseQuotationEntries.articleExpenseQuotationEntryTaxes,',
        'uploads',
      ),
    });
    const expenseQuotationMetaData =
      await this.expenseQuotationMetaDataService.duplicate(
        existingExpenseQuotation.expenseQuotationMetaData.id,
      );
    const sequential =
      await this.expenseQuotationSequenceService.getSequential();
    const expenseQuotation = await this.expenseQuotationRepository.save({
      ...existingExpenseQuotation,
      sequential,
      expenseQuotationMetaData,
      articleExpenseQuotationEntries: [],
      uploads: [],
      id: undefined,
      status: EXPENSE_QUOTATION_STATUS.Draft,
    });
    const articleExpenseQuotationEntries =
      await this.articleExpenseQuotationEntryService.duplicateMany(
        existingExpenseQuotation.articleExpenseQuotationEntries.map(
          (entry) => entry.id,
        ),
        expenseQuotation.id,
      );

    const uploads = duplicateExpenseQuotationDto.includeFiles
      ? await this.expenseQuotationUploadService.duplicateMany(
          existingExpenseQuotation.uploads.map((upload) => upload.id),
          expenseQuotation.id,
        )
      : [];

    return this.expenseQuotationRepository.save({
      ...expenseQuotation,
      articleExpenseQuotationEntries,
      uploads,
    });
  }

  async updateStatus(
    id: number,
    status: EXPENSE_QUOTATION_STATUS,
  ): Promise<ExpenseQuotationEntity> {
    const expenseQuotation =
      await this.expenseQuotationRepository.findOneById(id);
    return this.expenseQuotationRepository.save({
      id: expenseQuotation.id,
      status,
    });
  }

  async updateMany(
    updateExpenseQuotationDtos: UpdateExpenseQuotationDto[],
  ): Promise<ExpenseQuotationEntity[]> {
    return this.expenseQuotationRepository.updateMany(
      updateExpenseQuotationDtos,
    );
  }

  async updateExpenseQuotationSequence(
    updatedSequenceDto: UpdateExpenseQuotationSequenceDto,
  ): Promise<ExpenseQuotationSequence> {
    return (await this.expenseQuotationSequenceService.set(updatedSequenceDto))
      .value;
  }

  @Transactional()
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredExpenseQuotations() {
    const currentDate = new Date();
    const expiredExpenseQuotations: ExpenseQuotationEntity[] =
      await this.expenseQuotationRepository.findAll({
        where: {
          status: EXPENSE_QUOTATION_STATUS.Sent,
        },
      });
    const expenseQuotationsToExpire = expiredExpenseQuotations.filter(
      (expenseQuotation) =>
        isAfter(currentDate, new Date(expenseQuotation.dueDate)),
    );

    if (expenseQuotationsToExpire.length) {
      for (const expenseQuotation of expenseQuotationsToExpire) {
        expenseQuotation.status = EXPENSE_QUOTATION_STATUS.Expired;
        await this.expenseQuotationRepository.save(expenseQuotation);
      }
    }
  }

  async softDelete(id: number): Promise<ExpenseQuotationEntity> {
    await this.findOneById(id);
    return this.expenseQuotationRepository.softDelete(id);
  }

  async deleteAll() {
    return this.expenseQuotationRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.expenseQuotationRepository.getTotalCount();
  }
}
