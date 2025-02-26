import { Injectable } from '@nestjs/common';
import { ExpenseQuotationUploadRepository } from '../repositories/repository/expense-quotation-upload.repository';
import { ExpenseQuotationUploadEntity } from '../repositories/entities/expense-quotation-file.entity';
import { ExpenseQuotationUploadNotFoundException } from '../errors/expense-expense-quotation-upload.notfound';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { StorageService } from 'src/common/storage/services/storage.service';

@Injectable()
export class ExpenseQuotationUploadService {
  constructor(
    private readonly expenseQuotationUploadRepository: ExpenseQuotationUploadRepository,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: number): Promise<ExpenseQuotationUploadEntity> {
    const upload = await this.expenseQuotationUploadRepository.findOneById(id);
    if (!upload) {
      throw new ExpenseQuotationUploadNotFoundException();
    }
    return upload;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ExpenseQuotationUploadEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const upload = await this.expenseQuotationUploadRepository.findOne(
      queryOptions as FindOneOptions<ExpenseQuotationUploadEntity>,
    );
    if (!upload) return null;
    return upload;
  }

  async findAll(query: IQueryObject): Promise<ExpenseQuotationUploadEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.expenseQuotationUploadRepository.findAll(
      queryOptions as FindManyOptions<ExpenseQuotationUploadEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ExpenseQuotationUploadEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.expenseQuotationUploadRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.expenseQuotationUploadRepository.findAll(
      queryOptions as FindManyOptions<ExpenseQuotationUploadEntity>,
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
    expenseQuotationId: number,
    uploadId: number,
  ): Promise<ExpenseQuotationUploadEntity> {
    return this.expenseQuotationUploadRepository.save({
      expenseQuotationId,
      uploadId,
    });
  }

  async duplicate(
    id: number,
    expenseQuotationId: number,
  ): Promise<ExpenseQuotationUploadEntity> {
    //Find the original quotation upload entity
    const originalExpenseQuotationUpload = await this.findOneById(id);

    //Use the StorageService to duplicate the file
    const duplicatedUpload = await this.storageService.duplicate(
      originalExpenseQuotationUpload.uploadId,
    );

    //Save the duplicated ExpenseQuotationUploadEntity
    const duplicatedExpenseQuotationUpload =
      await this.expenseQuotationUploadRepository.save({
        expenseQuotationId: expenseQuotationId,
        uploadId: duplicatedUpload.id,
      });

    return duplicatedExpenseQuotationUpload;
  }

  async duplicateMany(
    ids: number[],
    expenseQuotationId: number,
  ): Promise<ExpenseQuotationUploadEntity[]> {
    const duplicatedExpenseQuotationUploads = await Promise.all(
      ids.map((id) => this.duplicate(id, expenseQuotationId)),
    );
    return duplicatedExpenseQuotationUploads;
  }

  async softDelete(id: number): Promise<ExpenseQuotationUploadEntity> {
    const upload = await this.findOneById(id);
    this.storageService.delete(upload.uploadId);
    this.expenseQuotationUploadRepository.softDelete(upload.id);
    return upload;
  }

  async softDeleteMany(
    expenseQuotationUploadEntities: ExpenseQuotationUploadEntity[],
  ): Promise<ExpenseQuotationUploadEntity[]> {
    this.storageService.deleteMany(
      expenseQuotationUploadEntities.map((qu) => qu.upload.id),
    );
    return this.expenseQuotationUploadRepository.softDeleteMany(
      expenseQuotationUploadEntities.map((qu) => qu.id),
    );
  }

  async deleteAll() {
    return this.expenseQuotationUploadRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.expenseQuotationUploadRepository.getTotalCount();
  }
}
