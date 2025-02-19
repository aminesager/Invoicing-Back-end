import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ExpenseInvoiceMetaDataRepository } from '../repositories/repository/expense-invoice-meta-data.repository';
import { ExpenseInvoiceMetaDataEntity } from '../repositories/entities/expense-invoice-meta-data.entity';
import { ExpenseInvoiceMetaDataNotFoundException } from '../errors/expense-invoice-meta-data.notfound.error';
import { ResponseExpenseInvoiceMetaDataDto } from '../dtos/expense-invoice-meta-data.response.dto';
import { CreateExpenseInvoiceMetaDataDto } from '../dtos/expense-invoice-meta-data.create.dto';
import { UpdateExpenseInvoiceMetaDataDto } from '../dtos/expense-invoice-meta-data.update.dto';

@Injectable()
export class ExpenseInvoiceMetaDataService {
  constructor(
    private readonly expenseInvoiceMetaDataRepository: ExpenseInvoiceMetaDataRepository,
  ) {}

  async findOneById(id: number): Promise<ExpenseInvoiceMetaDataEntity> {
    const data = await this.expenseInvoiceMetaDataRepository.findOneById(id);
    if (!data) {
      throw new ExpenseInvoiceMetaDataNotFoundException();
    }
    return data;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseExpenseInvoiceMetaDataDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const data = await this.expenseInvoiceMetaDataRepository.findOne(
      queryOptions as FindOneOptions<ExpenseInvoiceMetaDataEntity>,
    );
    if (!data) return null;
    return data;
  }

  async findAll(
    query: IQueryObject,
  ): Promise<ResponseExpenseInvoiceMetaDataDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.expenseInvoiceMetaDataRepository.findAll(
      queryOptions as FindManyOptions<ExpenseInvoiceMetaDataEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseExpenseInvoiceMetaDataDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.expenseInvoiceMetaDataRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.expenseInvoiceMetaDataRepository.findAll(
      queryOptions as FindManyOptions<ExpenseInvoiceMetaDataEntity>,
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

  async save(
    createExpenseInvoiceMetaDataDto: CreateExpenseInvoiceMetaDataDto,
  ): Promise<ExpenseInvoiceMetaDataEntity> {
    return this.expenseInvoiceMetaDataRepository.save(
      createExpenseInvoiceMetaDataDto,
    );
  }

  async update(
    id: number,
    updateExpenseInvoiceMetaDataDto: UpdateExpenseInvoiceMetaDataDto,
  ): Promise<ExpenseInvoiceMetaDataEntity> {
    const data = await this.findOneById(id);
    return this.expenseInvoiceMetaDataRepository.save({
      ...data,
      ...updateExpenseInvoiceMetaDataDto,
    });
  }

  async duplicate(id: number): Promise<ExpenseInvoiceMetaDataEntity> {
    const existingData = await this.findOneById(id);
    const duplicatedData = {
      ...existingData,
      id: undefined,
    };
    return this.expenseInvoiceMetaDataRepository.save(duplicatedData);
  }

  async softDelete(id: number): Promise<ExpenseInvoiceMetaDataEntity> {
    await this.findOneById(id);
    return this.expenseInvoiceMetaDataRepository.softDelete(id);
  }

  async deleteAll() {
    return this.expenseInvoiceMetaDataRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.expenseInvoiceMetaDataRepository.getTotalCount();
  }
}
