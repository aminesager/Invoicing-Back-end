import { Controller, Get, Post, Body } from '@nestjs/common';
import { BuyQuotationService } from '../services/buy-quotation.service';
import { CreateBuyQuotationDto } from '../dtos/create-buy-quotation.dto';

@Controller('buy-quotation')
export class BuyQuotationController {
  constructor(private readonly buyQuotationService: BuyQuotationService) {}

  @Post()
  async create(@Body() createBuyQuotationDto: CreateBuyQuotationDto) {
    return this.buyQuotationService.create(createBuyQuotationDto);
  }

  @Get()
  async findAll() {
    return this.buyQuotationService.findAll();
  }
}
