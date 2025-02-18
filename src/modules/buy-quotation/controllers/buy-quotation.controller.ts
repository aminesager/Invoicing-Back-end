import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BuyQuotationDto } from '../dtos/buy-quotation.dto';
import { BuyQuotationService } from '../services/buy-quotation.service';

@ApiTags('buy-quotation')
@Controller({
  version: '1',
  path: '/buy-quotation',
})
export class BuyQuotationController {
  constructor(private readonly buyQuotationService: BuyQuotationService) {}

  @Post()
  async create(@Body() buyQuotationDto: BuyQuotationDto) {
    return this.buyQuotationService.create(buyQuotationDto);
  }

  @Get()
  async findAll() {
    return this.buyQuotationService.findAll();
  }
}
