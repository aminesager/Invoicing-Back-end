import { Injectable } from '@nestjs/common';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/common/database/dtos/database.page-meta.dto';
import { StorageService } from 'src/common/storage/services/storage.service';
import { ExpensePaymentUploadRepository } from '../repositories/repository/expense-payment.repository';
import { ExpensePaymentUploadEntity } from '../repositories/entities/expense-payment-file.entity';
import { ExpensePaymentUploadNotFoundException } from '../errors/expense-payment-upload.notfound.error';

@Injectable()
export class ExpensePaymentUploadService {
  constructor(
    private readonly expensePaymentUploadRepository: ExpensePaymentUploadRepository,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: number): Promise<ExpensePaymentUploadEntity> {
    const upload = await this.expensePaymentUploadRepository.findOneById(id);
    if (!upload) {
      throw new ExpensePaymentUploadNotFoundException();
    }
    return upload;
  }

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ExpensePaymentUploadEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const upload = await this.expensePaymentUploadRepository.findOne(
      queryOptions as FindOneOptions<ExpensePaymentUploadEntity>,
    );
    if (!upload) return null;
    return upload;
  }

  async findAll(query: IQueryObject): Promise<ExpensePaymentUploadEntity[]> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    return await this.expensePaymentUploadRepository.findAll(
      queryOptions as FindManyOptions<ExpensePaymentUploadEntity>,
    );
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<ExpensePaymentUploadEntity>> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const count = await this.expensePaymentUploadRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.expensePaymentUploadRepository.findAll(
      queryOptions as FindManyOptions<ExpensePaymentUploadEntity>,
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
    expensePaymentId: number,
    uploadId: number,
  ): Promise<ExpensePaymentUploadEntity> {
    return this.expensePaymentUploadRepository.save({
      expensePaymentId,
      uploadId,
    });
  }

  async duplicate(
    id: number,
    expensePaymentId: number,
  ): Promise<ExpensePaymentUploadEntity> {
    //Find the original payment upload entity
    const originalExpensePaymentUpload = await this.findOneById(id);

    //Use the StorageService to duplicate the file
    const duplicatedUpload = await this.storageService.duplicate(
      originalExpensePaymentUpload.uploadId,
    );

    //Save the duplicated PaymentUploadEntity
    const duplicatedExpensePaymentUpload =
      await this.expensePaymentUploadRepository.save({
        expensePaymentId,
        uploadId: duplicatedUpload.id,
      });

    return duplicatedExpensePaymentUpload;
  }

  async duplicateMany(
    ids: number[],
    expensePaymentId: number,
  ): Promise<ExpensePaymentUploadEntity[]> {
    const duplicatedExpensePaymentUploads = await Promise.all(
      ids.map((id) => this.duplicate(id, expensePaymentId)),
    );
    return duplicatedExpensePaymentUploads;
  }

  async softDelete(id: number): Promise<ExpensePaymentUploadEntity> {
    const upload = await this.findOneById(id);
    this.storageService.delete(upload.uploadId);
    this.expensePaymentUploadRepository.softDelete(upload.id);
    return upload;
  }

  async softDeleteMany(
    quotationUploadEntities: ExpensePaymentUploadEntity[],
  ): Promise<ExpensePaymentUploadEntity[]> {
    this.storageService.deleteMany(
      quotationUploadEntities.map((qu) => qu.upload.id),
    );
    return this.expensePaymentUploadRepository.softDeleteMany(
      quotationUploadEntities.map((qu) => qu.id),
    );
  }

  async deleteAll() {
    return this.expensePaymentUploadRepository.deleteAll();
  }

  async getTotal(): Promise<number> {
    return this.expensePaymentUploadRepository.getTotalCount();
  }
}
