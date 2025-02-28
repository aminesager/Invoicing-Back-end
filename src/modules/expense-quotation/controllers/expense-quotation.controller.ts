import {
  UseInterceptors,
  Controller,
  Request,
  Delete,
  Header,
  Param,
  Query,
  Body,
  Post,
  Get,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { ExpenseQuotationService } from '../services/expense-quotation.service';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { ResponseExpenseQuotationDto } from '../dtos/expense-quotation.response.dto';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { CreateExpenseQuotationDto } from '../dtos/expense-quotation.create.dto';
import { UpdateExpenseQuotationDto } from '../dtos/expense-quotation.update.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
// import { UpdateExpenseQuotationSequenceDto } from '../dtos/expense-quotation-seqence.update.dto';
import { DuplicateExpenseQuotationDto } from '../dtos/expense-quotation.duplicate.dto';
// import { ExpenseQuotationSequence } from '../interfaces/expense-quotation-sequence.interface';
import { EXPENSE_QUOTATION_STATUS } from '../enums/expense-quotation-status.enum';
import { ExpenseInvoiceService } from 'src/modules/expense-invoice/services/expense-invoice.service';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { Request as ExpressRequest } from 'express';

@ApiTags('expense-quotation')
@Controller({
  version: '1',
  path: '/expense-quotation',
})
@UseInterceptors(LogInterceptor)
export class ExpenseQuotationController {
  constructor(
    private readonly expenseQuotationService: ExpenseQuotationService,
    private readonly expenseInvoiceService: ExpenseInvoiceService,
  ) {}

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseExpenseQuotationDto[]> {
    return this.expenseQuotationService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseExpenseQuotationDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseExpenseQuotationDto>> {
    return this.expenseQuotationService.findAllPaginated(query);
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseExpenseQuotationDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.expenseQuotationService.findOneByCondition(query);
  }

  @Get('/:id/download')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="quotation.pdf"')
  @LogEvent(EVENT_TYPE.EXPENSE_QUOTATION_PRINTED)
  async generatePdf(
    @Param('id') id: number,
    @Query() query: { template: string },
    @Request() req: ExpressRequest,
  ) {
    req.logInfo = { id };
    return this.expenseQuotationService.downloadPdf(id, query.template);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.EXPENSE_QUOTATION_CREATED)
  async save(
    @Body() createExpenseQuotationDto: CreateExpenseQuotationDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpenseQuotationDto> {
    const expenseQuotation = await this.expenseQuotationService.save(
      createExpenseQuotationDto,
    );
    req.logInfo = { id: expenseQuotation.id };
    return expenseQuotation;
  }

  @Post('/duplicate')
  @LogEvent(EVENT_TYPE.EXPENSE_QUOTATION_DUPLICATED)
  async duplicate(
    @Body() duplicateExpenseQuotationDto: DuplicateExpenseQuotationDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpenseQuotationDto> {
    const expenseQuotation = await this.expenseQuotationService.duplicate(
      duplicateExpenseQuotationDto,
    );
    req.logInfo = {
      id: duplicateExpenseQuotationDto.id,
      duplicateId: expenseQuotation.id,
    };
    return expenseQuotation;
  }

  // @Put('/update-expense-quotation-sequences')
  // @ApiParam({
  //   name: 'id',
  //   type: 'number',
  //   required: true,
  // })
  // async updateExpenseQuotationSequences(
  //   @Body() updatedSequenceDto: UpdateExpenseQuotationSequenceDto,
  // ): Promise<ExpenseQuotationSequence> {
  //   return this.expenseQuotationService.updateExpenseQuotationSequence(
  //     updatedSequenceDto,
  //   );
  // }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @ApiParam({
    name: 'create',
    type: 'boolean',
    required: false,
  })
  @Put('/expense-invoice/:id/:create')
  @LogEvent(EVENT_TYPE.EXPENSE_QUOTATION_INVOICED)
  async invoice(
    @Param('id') id: number,
    @Param('create') create: boolean,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpenseQuotationDto> {
    req.logInfo = { expenseQuotationId: id, expenseInvoiceId: null };
    const expenseQuotation =
      await this.expenseQuotationService.findOneByCondition({
        filter: `id||$eq||${id}`,
        join:
          'expenseQuotationMetaData,' +
          'articleExpenseQuotationEntries,' +
          `articleExpenseQuotationEntries.article,` +
          `articleExpenseQuotationEntries.articleExpenseQuotationEntryTaxes,` +
          `articleExpenseQuotationEntries.articleExpenseQuotationEntryTaxes.tax`,
      });
    if (
      expenseQuotation.status === EXPENSE_QUOTATION_STATUS.Invoiced ||
      create
    ) {
      const expenseInvoice =
        await this.expenseInvoiceService.saveFromQuotation(expenseQuotation);
      req.logInfo.expenseInvoiceId = expenseInvoice.id;
    }
    await this.expenseQuotationService.updateStatus(
      id,
      EXPENSE_QUOTATION_STATUS.Invoiced,
    );
    return this.expenseQuotationService.findOneByCondition({
      filter: `id||$eq||${id}`,
      join: 'expenseInvoices',
    });
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.EXPENSE_QUOTATION_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateExpenseQuotationDto: UpdateExpenseQuotationDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpenseQuotationDto> {
    req.logInfo = { id };
    return this.expenseQuotationService.update(id, updateExpenseQuotationDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.EXPENSE_QUOTATION_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpenseQuotationDto> {
    req.logInfo = { id };
    return this.expenseQuotationService.softDelete(id);
  }
}
