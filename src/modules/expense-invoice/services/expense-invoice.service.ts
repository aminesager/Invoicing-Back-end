/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, StreamableFile } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { FirmService } from 'src/modules/firm/services/firm.service';
import { InterlocutorService } from 'src/modules/interlocutor/services/interlocutor.service';
import { InvoicingCalculationsService } from 'src/common/calculations/services/invoicing.calculations.service';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions, UpdateResult } from 'typeorm';
import { PdfService } from 'src/common/pdf/services/pdf.service';
import { format } from 'date-fns';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { TaxService } from 'src/modules/tax/services/tax.service';
import { BankAccountService } from 'src/modules/bank-account/services/bank-account.service';
import { Transactional } from '@nestjs-cls/transactional';
import { ExpenseInvoiceRepository } from '../repositories/repository/expense-invoice.repository';
import { ArticleExpenseInvoiceEntryService } from './article-expense-invoice-entry.service';
import { ExpenseInvoiceUploadService } from './expense-invoice-upload.service';
import { ExpenseInvoiceMetaDataService } from './expense-invoice-meta-data.service';
// import { ExpenseInvoiceSequenceService } from './expense-invoice-sequence.service';
import { ExpenseInvoiceNotFoundException } from '../errors/expense-invoice.notfound.error';
import { ExpenseInvoiceEntity } from '../repositories/entities/expense-invoice.entity';
import { ResponseExpenseInvoiceDto } from '../dtos/expense-invoice.response.dto';
import { CreateExpenseInvoiceDto } from '../dtos/expense-invoice.create.dto';
import { UpdateExpenseInvoiceDto } from '../dtos/expense-invoice.update.dto';
import { ResponseExpenseInvoiceUploadDto } from '../dtos/expense-invoice-upload.response.dto';
import { ArticleExpenseInvoiceEntryEntity } from '../repositories/entities/article-expense-invoice-entry.entity';
import { DuplicateExpenseInvoiceDto } from '../dtos/expense-invoice.duplicate.dto';
import { EXPENSE_INVOICE_STATUS } from '../enums/expense-invoice-status.enum';
import { UpdateExpenseInvoiceSequenceDto } from '../dtos/expense-invoice-seqence.update.dto';
import { ExpenseInvoiceSequence } from '../interfaces/expense-invoice-sequence.interface';
import { ExpenseQuotationEntity } from 'src/modules/expense-quotation/repositories/entities/expense-quotation.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TaxWithholdingService } from 'src/modules/tax-withholding/services/tax-withholding.service';
import { ciel } from 'src/utils/number.utils';
import { parseSequential } from 'src/utils/sequence.utils';
import { ResponseExpenseInvoiceRangeDto } from '../dtos/expense-invoice-range.response.dto';

@Injectable()
export class ExpenseInvoiceService {
  constructor(
    //repositories
    private readonly expenseInvoiceRepository: ExpenseInvoiceRepository,
    //entity services
    private readonly articleExpenseInvoiceEntryService: ArticleExpenseInvoiceEntryService,
    private readonly expenseInvoiceUploadService: ExpenseInvoiceUploadService,
    private readonly bankAccountService: BankAccountService,
    private readonly currencyService: CurrencyService,
    private readonly firmService: FirmService,
    private readonly interlocutorService: InterlocutorService,
    // private readonly expenseInvoiceSequenceService: ExpenseInvoiceSequenceService,
    private readonly expenseInvoiceMetaDataService: ExpenseInvoiceMetaDataService,
    private readonly taxService: TaxService,
    private readonly taxWithholdingService: TaxWithholdingService,

    //abstract services
    private readonly calculationsService: InvoicingCalculationsService,
    private readonly pdfService: PdfService,
  ) {}

  async downloadPdf(id: number, template: string): Promise<StreamableFile> {
    const expenseInvoice = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: new String().concat(
        'firm,',
        'cabinet,',
        'currency,',
        'bankAccount,',
        'interlocutor,',
        'cabinet.address,',
        'expenseInvoiceMetaData,',
        // 'firm.deliveryAddress,',
        // 'firm.invoicingAddress,',
        'articleExpenseInvoiceEntries,',
        'articleExpenseInvoiceEntries.article,',
        'articleExpenseInvoiceEntries.articleExpenseInvoiceEntryTaxes,',
        'articleExpenseInvoiceEntries.articleExpenseInvoiceEntryTaxes.tax',
      ),
    });
    const digitsAferComma = expenseInvoice.currency.digitAfterComma;
    if (expenseInvoice) {
      const data = {
        meta: {
          ...expenseInvoice.expenseInvoiceMetaData,
          type: 'DEVIS',
        },
        expenseInvoice: {
          ...expenseInvoice,
          date: format(expenseInvoice.date, 'dd/MM/yyyy'),
          dueDate: format(expenseInvoice.dueDate, 'dd/MM/yyyy'),
          taxSummary: expenseInvoice.expenseInvoiceMetaData.taxSummary,
          subTotal: expenseInvoice.subTotal.toFixed(digitsAferComma),
          total: expenseInvoice.total.toFixed(digitsAferComma),
        },
      };

      const pdfBuffer = await this.pdfService.generatePdf(data, template);
      return new StreamableFile(pdfBuffer);
    } else {
      throw new ExpenseInvoiceNotFoundException();
    }
  }

  async findOneById(id: number): Promise<ExpenseInvoiceEntity> {
    const expenseInvoice = await this.expenseInvoiceRepository.findOneById(id);
    if (!expenseInvoice) {
      throw new ExpenseInvoiceNotFoundException();
    }
    return expenseInvoice;
  }

  async findOneByCondition(
    query: IQueryObject = {},
  ): Promise<ExpenseInvoiceEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const expenseInvoice = await this.expenseInvoiceRepository.findByCondition(
      queryOptions as FindOneOptions<ExpenseInvoiceEntity>,
    );
    if (!expenseInvoice) return null;
    return expenseInvoice;
  }

  async findAll(query: IQueryObject = {}): Promise<ExpenseInvoiceEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.expenseInvoiceRepository.findAll(
      queryOptions as FindManyOptions<ExpenseInvoiceEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseExpenseInvoiceDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.expenseInvoiceRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.expenseInvoiceRepository.findAll(
      queryOptions as FindManyOptions<ExpenseInvoiceEntity>,
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

  // async findExpenseInvoicesByRange(
  //   id: number,
  // ): Promise<ResponseExpenseInvoiceRangeDto> {
  //   // Get the current sequential
  //   const currentSequential = await this.expenseInvoiceSequenceService.get();
  //   const lastSequence = currentSequential.value.next - 1;

  //   // fetch the invoice
  //   const expenseInvoice = await this.findOneById(id);
  //   const { next } = parseSequential(expenseInvoice.sequential);

  //   // determine the previous and next invoices
  //   const previousExpenseInvoice =
  //     next != 1
  //       ? await this.findOneByCondition({
  //           filter: `sequential||$ends||${next - 1}`,
  //         })
  //       : null;

  //   const nextExpenseInvoice =
  //     next != lastSequence
  //       ? await this.findOneByCondition({
  //           filter: `sequential||$ends||${next + 1}`,
  //         })
  //       : null;

  //   return {
  //     next: nextExpenseInvoice,
  //     previous: previousExpenseInvoice,
  //   };
  // }

  @Transactional()
  async save(
    createExpenseInvoiceDto: CreateExpenseInvoiceDto,
  ): Promise<ExpenseInvoiceEntity> {
    // Parallelize fetching firm, bank account, and currency, as they are independent
    const [firm, bankAccount, currency] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${createExpenseInvoiceDto.firmId}`,
      }),
      createExpenseInvoiceDto.bankAccountId
        ? this.bankAccountService.findOneById(
            createExpenseInvoiceDto.bankAccountId,
          )
        : Promise.resolve(null),
      createExpenseInvoiceDto.currencyId
        ? this.currencyService.findOneById(createExpenseInvoiceDto.currencyId)
        : Promise.resolve(null),
    ]);

    if (!firm) {
      throw new Error('Firm not found');
    }

    // Check interlocutor existence
    await this.interlocutorService.findOneById(
      createExpenseInvoiceDto.interlocutorId,
    );

    // Save article entries if provided
    const articleEntries =
      createExpenseInvoiceDto.articleExpenseInvoiceEntries &&
      (await this.articleExpenseInvoiceEntryService.saveMany(
        createExpenseInvoiceDto.articleExpenseInvoiceEntries,
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

    // Fetch tax stamp if provided
    const taxStamp = createExpenseInvoiceDto.taxStampId
      ? await this.taxService.findOneById(createExpenseInvoiceDto.taxStampId)
      : null;

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        createExpenseInvoiceDto.discount,
        createExpenseInvoiceDto.discount_type,
        taxStamp?.value || 0,
      );

    // Format articleEntries as lineItems for tax calculations
    const lineItems =
      await this.articleExpenseInvoiceEntryService.findManyAsLineItem(
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

    // Fetch the latest sequential number for invoice
    // const sequential = await this.expenseInvoiceSequenceService.getSequential();

    // Save invoice metadata
    const expenseInvoiceMetaData =
      await this.expenseInvoiceMetaDataService.save({
        ...createExpenseInvoiceDto.expenseInvoiceMetaData,
        taxSummary,
      });

    // Ensure taxWithholding.rate is valid and calculate the withholding amount
    let taxWithholdingAmount = 0;
    if (createExpenseInvoiceDto.taxWithholdingId) {
      const taxWithholding = await this.taxWithholdingService.findOneById(
        createExpenseInvoiceDto.taxWithholdingId,
      );

      if (taxWithholding.rate !== undefined && taxWithholding.rate !== null) {
        taxWithholdingAmount =
          totalAfterGeneralDiscount * (taxWithholding.rate / 100);
      }
    }

    // Save the invoice entity
    const expenseInvoice = await this.expenseInvoiceRepository.save({
      ...createExpenseInvoiceDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      //this will be changed to fit with the connected cabinet
      cabinetId: 1,
      // sequential,
      articleExpenseInvoiceEntries: articleEntries,
      expenseInvoiceMetaData,
      subTotal,
      taxWithholdingAmount: taxWithholdingAmount || 0,
      total: totalAfterGeneralDiscount,
    });

    // Handle file uploads if they exist
    if (createExpenseInvoiceDto.uploads) {
      await Promise.all(
        createExpenseInvoiceDto.uploads.map((u) =>
          this.expenseInvoiceUploadService.save(expenseInvoice.id, u.uploadId),
        ),
      );
    }

    return expenseInvoice;
  }

  async saveMany(
    createExpenseInvoiceDtos: CreateExpenseInvoiceDto[],
  ): Promise<ExpenseInvoiceEntity[]> {
    const expenseInvoices = [];
    for (const createExpenseInvoiceDto of createExpenseInvoiceDtos) {
      const expenseInvoice = await this.save(createExpenseInvoiceDto);
      expenseInvoices.push(expenseInvoice);
    }
    return expenseInvoices;
  }

  @Transactional()
  async saveFromQuotation(
    expenseQuotation: ExpenseQuotationEntity,
  ): Promise<ExpenseInvoiceEntity> {
    return this.save({
      expenseQuotationId: expenseQuotation.id,
      currencyId: expenseQuotation.currencyId,
      bankAccountId: expenseQuotation.bankAccountId,
      interlocutorId: expenseQuotation.interlocutorId,
      firmId: expenseQuotation.firmId,
      discount: expenseQuotation.discount,
      discount_type: expenseQuotation.discount_type,
      object: expenseQuotation.object,
      status: EXPENSE_INVOICE_STATUS.Draft,
      date: new Date(),
      dueDate: null,
      articleExpenseInvoiceEntries:
        expenseQuotation.articleExpenseQuotationEntries.map((entry) => {
          return {
            unit_price: entry.unit_price,
            quantity: entry.quantity,
            discount: entry.discount,
            discount_type: entry.discount_type,
            subTotal: entry.subTotal,
            total: entry.total,
            articleId: entry.article.id,
            article: entry.article,
            taxes: entry.articleExpenseQuotationEntryTaxes.map((entry) => {
              return entry.taxId;
            }),
          };
        }),
    });
  }

  @Transactional()
  async update(
    id: number,
    updateExpenseInvoiceDto: UpdateExpenseInvoiceDto,
  ): Promise<ExpenseInvoiceEntity> {
    // Retrieve the existing invoice with necessary relations
    const { uploads: existingUploads, ...existingExpenseInvoice } =
      await this.findOneByCondition({
        filter: `id||$eq||${id}`,
        join: 'articleExpenseInvoiceEntries,expenseInvoiceMetaData,uploads,taxWithholding',
      });

    // Fetch and validate related entities
    const [firm, bankAccount, currency, interlocutor] = await Promise.all([
      this.firmService.findOneByCondition({
        filter: `id||$eq||${updateExpenseInvoiceDto.firmId}`,
      }),
      updateExpenseInvoiceDto.bankAccountId
        ? this.bankAccountService.findOneById(
            updateExpenseInvoiceDto.bankAccountId,
          )
        : null,
      updateExpenseInvoiceDto.currencyId
        ? this.currencyService.findOneById(updateExpenseInvoiceDto.currencyId)
        : null,
      updateExpenseInvoiceDto.interlocutorId
        ? this.interlocutorService.findOneById(
            updateExpenseInvoiceDto.interlocutorId,
          )
        : null,
    ]);

    // Soft delete old article entries to prepare for new ones
    const existingArticles =
      await this.articleExpenseInvoiceEntryService.softDeleteMany(
        existingExpenseInvoice.articleExpenseInvoiceEntries.map(
          (entry) => entry.id,
        ),
      );

    // Save new article entries
    const articleEntries: ArticleExpenseInvoiceEntryEntity[] =
      updateExpenseInvoiceDto.articleExpenseInvoiceEntries
        ? await this.articleExpenseInvoiceEntryService.saveMany(
            updateExpenseInvoiceDto.articleExpenseInvoiceEntries,
          )
        : existingArticles;

    // Calculate the subtotal and total for the new entries
    const { subTotal, total } =
      this.calculationsService.calculateLineItemsTotal(
        articleEntries.map((entry) => entry.total),
        articleEntries.map((entry) => entry.subTotal),
      );

    // Fetch tax stamp if provided
    const taxStamp = updateExpenseInvoiceDto.taxStampId
      ? await this.taxService.findOneById(updateExpenseInvoiceDto.taxStampId)
      : null;

    // Apply general discount
    const totalAfterGeneralDiscount =
      this.calculationsService.calculateTotalDiscount(
        total,
        updateExpenseInvoiceDto.discount,
        updateExpenseInvoiceDto.discount_type,
        taxStamp?.value || 0,
      );

    // Convert article entries to line items for further calculations
    const lineItems =
      await this.articleExpenseInvoiceEntryService.findManyAsLineItem(
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

    // Save or update the invoice metadata with the updated tax summary
    const expenseInvoiceMetaData =
      await this.expenseInvoiceMetaDataService.save({
        ...existingExpenseInvoice.expenseInvoiceMetaData,
        ...updateExpenseInvoiceDto.expenseInvoiceMetaData,
        taxSummary,
      });

    // Ensure taxWithholding.rate is valid and calculate the withholding amount
    let taxWithholdingAmount = 0;
    if (updateExpenseInvoiceDto.taxWithholdingId) {
      const taxWithholding = await this.taxWithholdingService.findOneById(
        updateExpenseInvoiceDto.taxWithholdingId,
      );

      if (taxWithholding.rate !== undefined && taxWithholding.rate !== null) {
        taxWithholdingAmount = ciel(
          totalAfterGeneralDiscount * (taxWithholding.rate / 100),
          currency.digitAfterComma + 1,
        );
      }
    }

    // Handle uploads - manage existing, new, and eliminated uploads
    const {
      keptItems: keptUploads,
      newItems: newUploads,
      eliminatedItems: eliminatedUploads,
    } = await this.expenseInvoiceRepository.updateAssociations({
      updatedItems: updateExpenseInvoiceDto.uploads,
      existingItems: existingUploads,
      onDelete: (id: number) => this.expenseInvoiceUploadService.softDelete(id),
      onCreate: (entity: ResponseExpenseInvoiceUploadDto) =>
        this.expenseInvoiceUploadService.save(
          entity.expenseInvoiceId,
          entity.uploadId,
        ),
    });

    // Save and return the updated invoice with all updated details
    return this.expenseInvoiceRepository.save({
      ...updateExpenseInvoiceDto,
      bankAccountId: bankAccount ? bankAccount.id : null,
      currencyId: currency ? currency.id : firm.currencyId,
      interlocutorId: interlocutor ? interlocutor.id : null,
      articleExpenseInvoiceEntries: articleEntries,
      expenseInvoiceMetaData,
      taxStampId: taxStamp ? taxStamp.id : null,
      subTotal,
      taxWithholdingAmount,
      total: totalAfterGeneralDiscount,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
    });
  }

  async updateFields(
    id: number,
    dict: QueryDeepPartialEntity<ExpenseInvoiceEntity>,
  ): Promise<UpdateResult> {
    return this.expenseInvoiceRepository.update(id, dict);
  }

  async duplicate(
    duplicateExpenseInvoiceDto: DuplicateExpenseInvoiceDto,
  ): Promise<ResponseExpenseInvoiceDto> {
    const existingExpenseInvoice = await this.findOneByCondition({
      filter: `id||$eq||${duplicateExpenseInvoiceDto.id}`,
      join: new String().concat(
        'expenseInvoiceMetaData,',
        'articleExpenseInvoiceEntries,',
        'articleExpenseInvoiceEntries.articleExpenseInvoiceEntryTaxes,',
        'uploads',
      ),
    });
    const expenseInvoiceMetaData =
      await this.expenseInvoiceMetaDataService.duplicate(
        existingExpenseInvoice.expenseInvoiceMetaData.id,
      );
    // const sequential = await this.expenseInvoiceSequenceService.getSequential();
    const expenseInvoice = await this.expenseInvoiceRepository.save({
      ...existingExpenseInvoice,
      id: undefined,
      // sequential,
      expenseInvoiceMetaData,
      articleExpenseInvoiceEntries: [],
      uploads: [],
      amountPaid: 0,
      status: EXPENSE_INVOICE_STATUS.Draft,
    });

    const articleExpenseInvoiceEntries =
      await this.articleExpenseInvoiceEntryService.duplicateMany(
        existingExpenseInvoice.articleExpenseInvoiceEntries.map(
          (entry) => entry.id,
        ),
        expenseInvoice.id,
      );

    const uploads = duplicateExpenseInvoiceDto.includeFiles
      ? await this.expenseInvoiceUploadService.duplicateMany(
          existingExpenseInvoice.uploads.map((upload) => upload.id),
          expenseInvoice.id,
        )
      : [];

    return this.expenseInvoiceRepository.save({
      ...expenseInvoice,
      articleExpenseInvoiceEntries,
      uploads,
    });
  }

  async updateMany(
    updateExpenseInvoiceDtos: UpdateExpenseInvoiceDto[],
  ): Promise<ExpenseInvoiceEntity[]> {
    return this.expenseInvoiceRepository.updateMany(updateExpenseInvoiceDtos);
  }

  // async updateExpenseInvoiceSequence(
  //   updatedSequenceDto: UpdateExpenseInvoiceSequenceDto,
  // ): Promise<ExpenseInvoiceSequence> {
  //   return (await this.expenseInvoiceSequenceService.set(updatedSequenceDto))
  //     .value;
  // }

  async softDelete(id: number): Promise<ExpenseInvoiceEntity> {
    await this.findOneById(id);
    return this.expenseInvoiceRepository.softDelete(id);
  }

  async deleteAll() {
    return this.expenseInvoiceRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.expenseInvoiceRepository.getTotalCount();
  }
}
