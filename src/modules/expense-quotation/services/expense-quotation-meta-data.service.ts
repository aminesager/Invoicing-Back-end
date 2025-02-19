import { Injectable } from '@nestjs/common';
import { ExpenseQuotationMetaDataRepository } from '../repositories/repository/expense-quotation-meta-data-repository';
import { ExpenseQuotationMetaDataEntity } from '../repositories/entities/expense-quotation-meta-data.entity';
import { ExpenseQuotationMetaDataNotFoundException } from '../errors/expense-quotation-meta-data.notfound.error';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { ResponseExpenseQuotationMetaDataDto } from '../dtos/expense-quotation-meta-data.response.dto';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { CreateExpenseQuotationMetaDataDto } from '../dtos/expense-quotation-meta-data.create.dto';
import { UpdateExpenseQuotationMetaDataDto } from '../dtos/expense-quotation-meta-data.update.dto';

@Injectable()
export class ExpenseQuotationMetaDataService {
  constructor(
    private readonly expenseQuotationMetaDataRepository: ExpenseQuotationMetaDataRepository,
  ) {}

  async findOneById(id: number): Promise<ExpenseQuotationMetaDataEntity> {
    const data = await this.expenseQuotationMetaDataRepository.findOneById(id);
    if (!data) {
      throw new ExpenseQuotationMetaDataNotFoundException();
    }
    return data;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ResponseExpenseQuotationMetaDataDto | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const data = await this.expenseQuotationMetaDataRepository.findOne(
      queryOptions as FindOneOptions<ExpenseQuotationMetaDataEntity>,
    );
    if (!data) return null;
    return data;
  }

  async findAll(
    query: IQueryObject,
  ): Promise<ResponseExpenseQuotationMetaDataDto[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.expenseQuotationMetaDataRepository.findAll(
      queryOptions as FindManyOptions<ExpenseQuotationMetaDataEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ResponseExpenseQuotationMetaDataDto>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.expenseQuotationMetaDataRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.expenseQuotationMetaDataRepository.findAll(
      queryOptions as FindManyOptions<ExpenseQuotationMetaDataEntity>,
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
    createExpenseQuotationMetaDataDto: CreateExpenseQuotationMetaDataDto,
  ): Promise<ExpenseQuotationMetaDataEntity> {
    return this.expenseQuotationMetaDataRepository.save(
      createExpenseQuotationMetaDataDto,
    );
  }

  async update(
    id: number,
    updateExpenseQuotationMetaDataDto: UpdateExpenseQuotationMetaDataDto,
  ): Promise<ExpenseQuotationMetaDataEntity> {
    const data = await this.findOneById(id);
    return this.expenseQuotationMetaDataRepository.save({
      ...data,
      ...updateExpenseQuotationMetaDataDto,
    });
  }

  async duplicate(id: number): Promise<ExpenseQuotationMetaDataEntity> {
    const existingData = await this.findOneById(id);
    const duplicatedData = {
      ...existingData,
      id: undefined,
    };
    return this.expenseQuotationMetaDataRepository.save(duplicatedData);
  }

  async softDelete(id: number): Promise<ExpenseQuotationMetaDataEntity> {
    await this.findOneById(id);
    return this.expenseQuotationMetaDataRepository.softDelete(id);
  }

  async deleteAll() {
    return this.expenseQuotationMetaDataRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.expenseQuotationMetaDataRepository.getTotalCount();
  }
}
