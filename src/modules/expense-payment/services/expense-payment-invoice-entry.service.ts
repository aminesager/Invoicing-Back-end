import { Injectable } from '@nestjs/common';
import { ExpensePaymentInvoiceEntryRepository } from '../repositories/repository/expense-payment-invoice-entry.entity';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { ResponseExpensePaymentInvoiceEntryDto } from '../dtos/expense-payment-invoice-entry.response.dto';
import { QueryBuilder } from 'src/common/database/utils/database-query-builder';
import { FindOneOptions } from 'typeorm';
import { ExpensePaymentInvoiceEntryEntity } from '../repositories/entities/expense-payment-invoice-entry.entity';
import { ExpensePaymentInvoiceEntryNotFoundException } from '../errors/expense-payment-invoice-entry.notfound.error';
import { CreateExpensePaymentInvoiceEntryDto } from '../dtos/expense-payment-invoice-entry.create.dto';
import { UpdateExpensePaymentInvoiceEntryDto } from '../dtos/expense-payment-invoice-entry.update.dto';
import { ExpenseInvoiceService } from 'src/modules/expense-invoice/services/expense-invoice.service';
import { Transactional } from '@nestjs-cls/transactional';
import { EXPENSE_INVOICE_STATUS } from 'src/modules/expense-invoice/enums/expense-invoice-status.enum';
import { createDineroAmountFromFloatWithDynamicCurrency } from 'src/utils/money.utils';
import * as dinero from 'dinero.js';

@Injectable()
export class ExpensePaymentInvoiceEntryService {
  constructor(
    private readonly expensePaymentInvoiceEntryRepository: ExpensePaymentInvoiceEntryRepository,
    private readonly expenseInvoiceService: ExpenseInvoiceService,
  ) {}

  async findOneByCondition(
    query: IQueryObject,
  ): Promise<ExpensePaymentInvoiceEntryEntity | null> {
    const queryBuilder = new QueryBuilder();
    const queryOptions = queryBuilder.build(query);
    const entry = await this.expensePaymentInvoiceEntryRepository.findOne(
      queryOptions as FindOneOptions<ExpensePaymentInvoiceEntryEntity>,
    );
    if (!entry) return null;
    return entry;
  }

  async findOneById(
    id: number,
  ): Promise<ResponseExpensePaymentInvoiceEntryDto> {
    const entry =
      await this.expensePaymentInvoiceEntryRepository.findOneById(id);
    if (!entry) {
      throw new ExpensePaymentInvoiceEntryNotFoundException();
    }
    return entry;
  }

  @Transactional()
  async save(
    createExpensePaymentInvoiceEntryDto: CreateExpensePaymentInvoiceEntryDto,
  ): Promise<ExpensePaymentInvoiceEntryEntity> {
    const existingInvoice = await this.expenseInvoiceService.findOneByCondition(
      {
        filter: `id||$eq||${createExpensePaymentInvoiceEntryDto.expenseInvoiceId}`,
        join: 'currency',
      },
    );

    const zero = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        0,
        createExpensePaymentInvoiceEntryDto.digitAfterComma,
      ),
      precision: createExpensePaymentInvoiceEntryDto.digitAfterComma,
    });

    const amountAlreadyPaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.amountPaid,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const taxWithholdingAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.taxWithholdingAmount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const amountToBePaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        createExpensePaymentInvoiceEntryDto.amount,
        createExpensePaymentInvoiceEntryDto.digitAfterComma,
      ),
      precision: createExpensePaymentInvoiceEntryDto.digitAfterComma,
    });

    const totalAmountPaid = amountAlreadyPaid.add(amountToBePaid);

    const invoiceTotal = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.total,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newInvoiceStatus = totalAmountPaid.equalsTo(zero)
      ? EXPENSE_INVOICE_STATUS.Unpaid
      : totalAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? EXPENSE_INVOICE_STATUS.Paid
        : EXPENSE_INVOICE_STATUS.PartiallyPaid;

    await this.expenseInvoiceService.updateFields(existingInvoice.id, {
      amountPaid: totalAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });

    return this.expensePaymentInvoiceEntryRepository.save(
      createExpensePaymentInvoiceEntryDto,
    );
  }

  @Transactional()
  async saveMany(
    createExpensePaymentInvoiceEntryDtos: CreateExpensePaymentInvoiceEntryDto[],
  ): Promise<ExpensePaymentInvoiceEntryEntity[]> {
    const savedEntries = [];
    for (const dto of createExpensePaymentInvoiceEntryDtos) {
      const savedEntry = await this.save(dto);
      savedEntries.push(savedEntry);
    }
    return savedEntries;
  }

  @Transactional()
  async update(
    id: number,
    updateExpensePaymentInvoiceEntryDto: UpdateExpensePaymentInvoiceEntryDto,
  ): Promise<ExpensePaymentInvoiceEntryEntity> {
    const existingEntry = await this.findOneById(id);

    const existingInvoice = await this.expenseInvoiceService.findOneByCondition(
      {
        filter: `id||$eq||${existingEntry.expenseInvoiceId}`,
        join: 'currency',
      },
    );

    const currentAmountPaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.amountPaid,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const oldEntryAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingEntry.amount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const updatedEntryAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        updateExpensePaymentInvoiceEntryDto.amount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const taxWithholdingAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.taxWithholdingAmount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newAmountPaid = currentAmountPaid
      .subtract(oldEntryAmount)
      .add(updatedEntryAmount);

    const zero = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        0,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const invoiceTotal = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.total,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newInvoiceStatus = newAmountPaid.equalsTo(zero)
      ? EXPENSE_INVOICE_STATUS.Unpaid
      : newAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? EXPENSE_INVOICE_STATUS.Paid
        : EXPENSE_INVOICE_STATUS.PartiallyPaid;

    await this.expenseInvoiceService.updateFields(existingInvoice.id, {
      amountPaid: newAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });

    return this.expensePaymentInvoiceEntryRepository.save({
      ...existingEntry,
      ...updateExpensePaymentInvoiceEntryDto,
    });
  }

  @Transactional()
  async softDelete(id: number): Promise<ExpensePaymentInvoiceEntryEntity> {
    const existingEntry = await this.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'payment',
    });

    const existingInvoice = await this.expenseInvoiceService.findOneByCondition(
      {
        filter: `id||$eq||${existingEntry.expenseInvoiceId}`,
        join: 'currency',
      },
    );

    const zero = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        0,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const totalAmountPaid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.amountPaid,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const amountToDeduct = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingEntry.amount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const taxWithholdingAmount = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.taxWithholdingAmount,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const updatedAmountPaid = totalAmountPaid.subtract(amountToDeduct);

    const invoiceTotal = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        existingInvoice.total,
        existingInvoice.currency.digitAfterComma,
      ),
      precision: existingInvoice.currency.digitAfterComma,
    });

    const newInvoiceStatus = updatedAmountPaid.equalsTo(zero)
      ? EXPENSE_INVOICE_STATUS.Unpaid
      : updatedAmountPaid.add(taxWithholdingAmount).equalsTo(invoiceTotal)
        ? EXPENSE_INVOICE_STATUS.Paid
        : EXPENSE_INVOICE_STATUS.PartiallyPaid;

    await this.expenseInvoiceService.updateFields(existingInvoice.id, {
      amountPaid: updatedAmountPaid.toUnit(),
      status: newInvoiceStatus,
    });

    return this.expensePaymentInvoiceEntryRepository.softDelete(id);
  }

  @Transactional()
  async softDeleteMany(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.softDelete(id);
    }
  }
}
