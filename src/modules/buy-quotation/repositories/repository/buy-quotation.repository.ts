import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuyQuotationEntity } from '../entities/buy-quotation.entity';
import { CreateBuyQuotationDto } from '../../dtos/create-buy-quotation.dto';

@Injectable()
export class BuyQuotationRepository {
  constructor(
    @InjectRepository(BuyQuotationEntity)
    private readonly buyQuotationRepository: Repository<BuyQuotationEntity>,
  ) {}

  async create(createBuyQuotationDto: CreateBuyQuotationDto) {
    const newRecord = this.buyQuotationRepository.create(createBuyQuotationDto);
    return this.buyQuotationRepository.save(newRecord);
  }

  async findAll() {
    return this.buyQuotationRepository.find();
  }
}
