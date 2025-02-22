import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { PageDto } from 'src/common/database/dtos/database.page.dto';
import { ApiPaginatedResponse } from 'src/common/database/decorators/ApiPaginatedResponse';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { ExpensePaymentService } from '../services/expense-payment.service';
import { ResponseExpensePaymentDto } from '../dtos/expense-payment.response.dto';
import { CreateExpensePaymentDto } from '../dtos/expense-payment.create.dto';
import { UpdateExpensePaymentDto } from '../dtos/expense-payment.update.dto';
import { LogInterceptor } from 'src/common/logger/decorators/logger.interceptor';
import { EVENT_TYPE } from 'src/app/enums/logger/event-types.enum';
import { LogEvent } from 'src/common/logger/decorators/log-event.decorator';
import { Request as ExpressRequest } from 'express';

@ApiTags('expense-payment')
@Controller({
  version: '1',
  path: '/expense-payment',
})
@UseInterceptors(LogInterceptor)
export class ExpensePaymentController {
  constructor(private readonly expensePaymentService: ExpensePaymentService) {}

  @Get('/all')
  async findAll(
    @Query() options: IQueryObject,
  ): Promise<ResponseExpensePaymentDto[]> {
    return this.expensePaymentService.findAll(options);
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseExpensePaymentDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseExpensePaymentDto>> {
    return this.expensePaymentService.findAllPaginated(query);
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
  ): Promise<ResponseExpensePaymentDto> {
    query.filter
      ? (query.filter += `,id||$eq||${id}`)
      : (query.filter = `id||$eq||${id}`);
    return this.expensePaymentService.findOneByCondition(query);
  }

  @Post('')
  @LogEvent(EVENT_TYPE.EXPENSE_PAYMENT_CREATED)
  async save(
    @Body() createExpensePaymentDto: CreateExpensePaymentDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpensePaymentDto> {
    const expensePayment = await this.expensePaymentService.save(
      createExpensePaymentDto,
    );
    req.logInfo = { id: expensePayment.id };
    return expensePayment;
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Put('/:id')
  @LogEvent(EVENT_TYPE.EXPENSE_PAYMENT_UPDATED)
  async update(
    @Param('id') id: number,
    @Body() updateActivityDto: UpdateExpensePaymentDto,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpensePaymentDto> {
    req.logInfo = { id };
    return this.expensePaymentService.update(id, updateActivityDto);
  }

  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  @Delete('/:id')
  @LogEvent(EVENT_TYPE.EXPENSE_PAYMENT_DELETED)
  async delete(
    @Param('id') id: number,
    @Request() req: ExpressRequest,
  ): Promise<ResponseExpensePaymentDto> {
    req.logInfo = { id };
    return this.expensePaymentService.softDelete(id);
  }
}
