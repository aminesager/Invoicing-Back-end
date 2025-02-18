import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuyQuotationDto } from '../../dtos/buy-quotation.dto';
import { BuyQuotationEntity } from '../entities/buy-quotation.entity';

@Injectable()
export class BuyQuotationRepository {
  constructor(
    @InjectRepository(BuyQuotationEntity) //automatically connects this repository to the correct database table hhh
    private readonly buyQuotationRepository: Repository<BuyQuotationEntity>,
  ) {}

  async create(buyQuotationDto: BuyQuotationDto) {
    const newRecord = this.buyQuotationRepository.create(buyQuotationDto);
    return this.buyQuotationRepository.save(newRecord);
  }

  async findAll() {
    return this.buyQuotationRepository.find();
  }
}
