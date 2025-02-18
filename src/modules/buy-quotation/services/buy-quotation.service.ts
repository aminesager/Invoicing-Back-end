import { Injectable } from '@nestjs/common';
import { BuyQuotationDto } from '../dtos/buy-quotation.dto';
import { BuyQuotationRepository } from '../repositories/repository/buy-quotation.repository';

@Injectable()
export class BuyQuotationService {
  constructor(
    private readonly buyQuotationRepository: BuyQuotationRepository,
  ) {}

  async create(buyQuotationDto: BuyQuotationDto) {
    return this.buyQuotationRepository.create(buyQuotationDto);
  }

  async findAll() {
    return this.buyQuotationRepository.findAll();
  }
}
