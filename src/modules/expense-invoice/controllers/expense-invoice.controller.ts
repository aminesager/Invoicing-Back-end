import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { ExpenseInvoiceService } from '../services/expense-invoice.service';
import { ResponseExpenseInvoiceDto } from '../dtos/expense-invoice.response.dto';
import { CreateExpenseInvoiceDto } from '../dtos/expense-invoice.create.dto';
import { DuplicateExpenseInvoiceDto } from '../dtos/expense-invoice.duplicate.dto';
// import { ExpenseInvoiceSequence } from '../interfaces/expense-invoice-sequence.interface';
// import { UpdateExpenseInvoiceSequenceDto } from '../dtos/expense-invoice-seqence.update.dto';
import { UpdateExpenseInvoiceDto } from '../dtos/expense-invoice.update.dto';
// import { ResponseExpenseInvoiceRangeDto } from '../dtos/expense-invoice-range.response.dto';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';

@ApiTags('expense-invoice')
@Controller({
  version: '1',
  path: '/expense-invoice',
})
@UseInterceptors(LogInterceptor)
export class ExpenseInvoiceController {
  constructor(private readonly expenseInvoiceService: ExpenseInvoiceService) {}

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseExpenseInvoiceDto[]> {
    return this.expenseInvoiceService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseExpenseInvoiceDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseExpenseInvoiceDto>> {
    return this.expenseInvoiceService.findAllPaginated(query);
  }

  // @Get('/sequential-range/:id')
  // async findExpenseInvoicesByRange(
  //   @Param('id') id: number,
  // ): Promise<ResponseExpenseInvoiceRangeDto> {
  //   return this.expenseInvoiceService.findExpenseInvoicesByRange(id);
  // }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseExpenseInvoiceDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.expenseInvoiceService.findOneByCondition(query);
  }

  @Get('/:id/download')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="invoice.pdf"')
  @LogEvent(EVENT_TYPE.EXPENSE_INVOICE_PRINTED)
  async generatePdf(
    @Param('id') id: number,
    @Query() query: { template: string },
    @Request() req: ExpressRequest,
  ) {
    req.logInfo = { id };
    return this.expenseInvoiceService.downloadPdf(id, query.template);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.EXPENSE_INVOICE_CREATED)
  async save(
    @Body() createExpenseInvoiceDto: CreateExpenseInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpenseInvoiceDto> {
    const expenseInvoice = await this.expenseInvoiceService.save(
      createExpenseInvoiceDto,
    );
    req.logInfo = { id: expenseInvoice.id };
    return expenseInvoice;
  }

  @Post('/duplicate')
  @LogEvent(EVENT_TYPE.EXPENSE_INVOICE_DUPLICATED)
  async duplicate(
    @Body() duplicateExpenseInvoiceDto: DuplicateExpenseInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpenseInvoiceDto> {
    const expenseInvoice = await this.expenseInvoiceService.duplicate(
      duplicateExpenseInvoiceDto,
    );
    req.logInfo = {
      id: duplicateExpenseInvoiceDto.id,
      duplicateId: expenseInvoice.id,
    };
    return expenseInvoice;
  }

  // @ApiParam({
  //   name: 'id',
  //   type: 'number',
  //   required: true,
  // })
  // @Put('/update-expense-invoice-sequences')
  // async updateExpenseInvoiceSequences(
  //   @Body() updatedSequenceDto: UpdateExpenseInvoiceSequenceDto,
  // ): Promise<ExpenseInvoiceSequence> {
  //   return this.expenseInvoiceService.updateExpenseInvoiceSequence(
  //     updatedSequenceDto,
  //   );
  // }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.EXPENSE_INVOICE_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateExpenseInvoiceDto: UpdateExpenseInvoiceDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpenseInvoiceDto> {
    req.logInfo = { id };
    return this.expenseInvoiceService.update(id, updateExpenseInvoiceDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.EXPENSE_INVOICE_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpenseInvoiceDto> {
    req.logInfo = { id };
    return this.expenseInvoiceService.softDelete(id);
  }
}
