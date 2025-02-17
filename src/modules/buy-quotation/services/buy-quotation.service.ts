import { Injectable } from '@nestjs/common';
import { CreateBuyQuotationDto } from '../dtos/create-buy-quotation.dto';
import { BuyQuotationRepository } from '../repositories/repository/buy-quotation.repository';

@Injectable()
export class BuyQuotationService {
  constructor(
    private readonly buyQuotationRepository: BuyQuotationRepository,
  ) {}

  async create(createBuyQuotationDto: CreateBuyQuotationDto) {
    return this.buyQuotationRepository.create(createBuyQuotationDto);
  }

  async findAll() {
    return this.buyQuotationRepository.findAll();
  }
}
