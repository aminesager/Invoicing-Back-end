import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BuyInvoiceService } from '../services/buy-invoice.service';
import { BuyInvoiceDto } from '../dtos/buy-invoice.dto';

@ApiTags('buy-invoice')
@Controller({
  version: '1',
  path: '/buy-invoice',
})
export class BuyInvoiceController {
  constructor(private readonly buyInvoiceService: BuyInvoiceService) {}

  @Post()
  async create(@Body() buyInvoiceDto: BuyInvoiceDto) {
    return this.buyInvoiceService.create(buyInvoiceDto);
  }

  @Get()
  async findAll() {
    return this.buyInvoiceService.findAll();
  }
}
