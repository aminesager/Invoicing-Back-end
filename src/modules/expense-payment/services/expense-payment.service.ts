import { Injectable } from '@nestjs/common';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { ExpensePaymentRepository } from '../repositories/repository/expense-payment-file.entity';
import { ExpensePaymentEntity } from '../repositories/entities/expense-payment.entity';
import { ExpensePaymentNotFoundException } from '../errors/expense-payment.notfound.error';
import { ResponseExpensePaymentDto } from '../dtos/expense-payment.response.dto';
import { CreateExpensePaymentDto } from '../dtos/expense-payment.create.dto';
import { UpdateExpensePaymentDto } from '../dtos/expense-payment.update.dto';
import { ExpenseInvoiceService } from 'src/modules/expense-invoice/services/expense-invoice.service';
import { Transactional } from '@nestjs-cls/transactional';
import { ExpensePaymentInvoiceEntryService } from './expense-payment-invoice-entry.service';
import { CurrencyService } from 'src/modules/currency/services/currency.service';
import { ExpensePaymentUploadService } from './expense-payment-upload.service';
import { ResponseExpensePaymentUploadDto } from '../dtos/expense-payment-upload.response.dto';

@Injectable()
export class ExpensePaymentService {
  constructor(
    private readonly expensePaymentRepository: ExpensePaymentRepository,
    private readonly expensePaymentInvoiceEntryService: ExpensePaymentInvoiceEntryService,
    private readonly expensePaymentUploadService: ExpensePaymentUploadService,
    private readonly expenseInvoiceService: ExpenseInvoiceService,
    private readonly currencyService: CurrencyService,
  ) {}

  async findOneById(id: number): Promise<ExpensePaymentEntity> {
    const expensePayment = await this.expensePaymentRepository.findOneById(id);
    if (!expensePayment) {
      throw new ExpensePaymentNotFoundException();
    }
    return expensePayment;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseExpensePaymentDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const expensePayment = await this.expensePaymentRepository.findOne(
      queryOptions as FindOneOptions<ExpensePaymentEntity>,
    );
    if (!expensePayment) return null;
    return expensePayment;
  }

  async findAll(query: IQueryObject): Promise<ResponseExpensePaymentDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.expensePaymentRepository.findAll(
      queryOptions as FindManyOptions<ExpensePaymentEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseExpensePaymentDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.expensePaymentRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.expensePaymentRepository.findAll(
      queryOptions as FindManyOptions<ExpensePaymentEntity>,
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
    createExpensePaymentDto: CreateExpensePaymentDto,
  ): Promise<ExpensePaymentEntity> {
    const expensePayment = await this.expensePaymentRepository.save(
      createExpensePaymentDto,
    );
    const currency = await this.currencyService.findOneById(
      expensePayment.currencyId,
    );
    const invoiceEntries = await Promise.all(
      createExpensePaymentDto.expenseInvoices.map(async (entry) => {
        const invoice = await this.expenseInvoiceService.findOneById(
          entry.expenseInvoiceId,
        );
        return {
          paymentId: expensePayment.id,
          invoiceId: entry.expenseInvoiceId,
          amount:
            entry.amount *
            (invoice.currencyId !== expensePayment.currencyId
              ? expensePayment.convertionRate
              : 1),
          digitAfterComma: currency.digitAfterComma,
        };
      }),
    );
    await this.expensePaymentInvoiceEntryService.saveMany(invoiceEntries);
    // Handle file uploads if they exist
    if (createExpensePaymentDto.uploads) {
      await Promise.all(
        createExpensePaymentDto.uploads.map((u) =>
          this.expensePaymentUploadService.save(expensePayment.id, u.uploadId),
        ),
      );
    }
    return expensePayment;
  }

  @Transactional()
  async update(
    id: number,
    updateExpensePaymentDto: UpdateExpensePaymentDto,
  ): Promise<ExpensePaymentEntity> {
    const existingExpensePayment = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'expenseInvoices,uploads',
    });
    await this.expensePaymentInvoiceEntryService.softDeleteMany(
      existingExpensePayment.expenseInvoices.map((entry) => entry.id),
    );

    // Handle uploads - manage existing, new, and eliminated uploads
    const {
      keptItems: keptUploads,
      newItems: newUploads,
      eliminatedItems: eliminatedUploads,
    } = await this.expensePaymentRepository.updateAssociations({
      updatedItems: updateExpensePaymentDto.uploads,
      existingItems: existingExpensePayment.uploads,
      onDelete: (id: number) => this.expensePaymentUploadService.softDelete(id),
      onCreate: (entity: ResponseExpensePaymentUploadDto) =>
        this.expensePaymentUploadService.save(
          entity.expensePaymentId,
          entity.uploadId,
        ),
    });

    const expensePayment = await this.expensePaymentRepository.save({
      ...existingExpensePayment,
      ...updateExpensePaymentDto,
      uploads: [...keptUploads, ...newUploads, ...eliminatedUploads],
    });

    const currency = await this.currencyService.findOneById(
      expensePayment.currencyId,
    );

    const invoiceEntries = await Promise.all(
      updateExpensePaymentDto.expenseInvoices.map(async (entry) => {
        const invoice = await this.expenseInvoiceService.findOneById(
          entry.expenseInvoiceId,
        );
        return {
          expensePaymentId: expensePayment.id,
          invoiceId: entry.expenseInvoiceId,
          amount:
            entry.amount *
            (invoice.currencyId !== expensePayment.currencyId
              ? expensePayment.convertionRate
              : 1),
          digitAfterComma: currency.digitAfterComma,
        };
      }),
    );

    await this.expensePaymentInvoiceEntryService.saveMany(invoiceEntries);

    return expensePayment;
  }

  @Transactional()
  async softDelete(id: number): Promise<ExpensePaymentEntity> {
    const existingExpensePayment = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'expenseInvoices',
    });
    await this.expensePaymentInvoiceEntryService.softDeleteMany(
      existingExpensePayment.expenseInvoices.map((invoice) => invoice.id),
    );
    return this.expensePaymentRepository.softDelete(id);
  }

  async deleteAll() {
    return this.expensePaymentRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.expensePaymentRepository.getTotalCount();
  }
}
