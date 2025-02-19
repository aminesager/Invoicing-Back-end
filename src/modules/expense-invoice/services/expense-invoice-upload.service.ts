import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { StorageService } from 'src/common/storage/services/storage.service';
import { ExpenseInvoiceUploadRepository } from '../repositories/repository/expense-invoice-upload.repository';
import { ExpenseInvoiceUploadEntity } from '../repositories/entities/expense-invoice-file.entity';
import { ExpenseInvoiceUploadNotFoundException } from '../errors/expense-invoice-upload.notfound';

@Injectable()
export class ExpenseInvoiceUploadService {
  constructor(
    private readonly expenseInvoiceUploadRepository: ExpenseInvoiceUploadRepository,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: number): Promise<ExpenseInvoiceUploadEntity> {
    const upload = await this.expenseInvoiceUploadRepository.findOneById(id);
    if (!upload) {
      throw new ExpenseInvoiceUploadNotFoundException();
    }
    return upload;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ExpenseInvoiceUploadEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const upload = await this.expenseInvoiceUploadRepository.findOne(
      queryOptions as FindOneOptions<ExpenseInvoiceUploadEntity>,
    );
    if (!upload) return null;
    return upload;
  }

  async findAll(query: IQueryObject): Promise<ExpenseInvoiceUploadEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.expenseInvoiceUploadRepository.findAll(
      queryOptions as FindManyOptions<ExpenseInvoiceUploadEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ExpenseInvoiceUploadEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.expenseInvoiceUploadRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.expenseInvoiceUploadRepository.findAll(
      queryOptions as FindManyOptions<ExpenseInvoiceUploadEntity>,
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
    expenseInvoiceId: number,
    uploadId: number,
  ): Promise<ExpenseInvoiceUploadEntity> {
    return this.expenseInvoiceUploadRepository.save({
      expenseInvoiceId,
      uploadId,
    });
  }

  async duplicate(
    id: number,
    expenseInvoiceId: number,
  ): Promise<ExpenseInvoiceUploadEntity> {
    //Find the original invoice upload entity
    const originalExpenseInvoiceUpload = await this.findOneById(id);

    //Use the StorageService to duplicate the file
    const duplicatedUpload = await this.storageService.duplicate(
      originalExpenseInvoiceUpload.uploadId,
    );

    //Save the duplicated InvoiceUploadEntity
    const duplicatedExpenseInvoiceUpload =
      await this.expenseInvoiceUploadRepository.save({
        expenseInvoiceId: expenseInvoiceId,
        uploadId: duplicatedUpload.id,
      });

    return duplicatedExpenseInvoiceUpload;
  }

  async duplicateMany(
    ids: number[],
    expenseInvoiceId: number,
  ): Promise<ExpenseInvoiceUploadEntity[]> {
    const duplicatedInvoiceUploads = await Promise.all(
      ids.map((id) => this.duplicate(id, expenseInvoiceId)),
    );
    return duplicatedExpenseInvoiceUploads;
  }

  async softDelete(id: number): Promise<ExpenseInvoiceUploadEntity> {
    const upload = await this.findOneById(id);
    this.storageService.delete(upload.uploadId);
    this.expenseInvoiceUploadRepository.softDelete(upload.id);
    return upload;
  }

  async softDeleteMany(
    expenseInvoiceUploadEntities: ExpenseInvoiceUploadEntity[],
  ): Promise<ExpenseInvoiceUploadEntity[]> {
    this.storageService.deleteMany(
      expenseInvoiceUploadEntities.map((qu) => qu.upload.id),
    );
    return this.expenseInvoiceUploadRepository.softDeleteMany(
      expenseInvoiceUploadEntities.map((qu) => qu.id),
    );
  }

  async deleteAll() {
    return this.expenseInvoiceUploadRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.expenseInvoiceUploadRepository.getTotalCount();
  }
}
