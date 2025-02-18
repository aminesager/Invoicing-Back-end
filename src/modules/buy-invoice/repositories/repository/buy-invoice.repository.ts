import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuyInvoiceEntity } from '../entities/buy-invoice.entity';
import { BuyInvoiceDto } from '../../dtos/buy-invoice.dto';

@Injectable()
export class BuyInvoiceRepository {
  constructor(
    @InjectRepository(BuyInvoiceEntity)
    private readonly buyInvoiceRepository: Repository<BuyInvoiceEntity>,
  ) {}

  async create(buyInvoiceDto: BuyInvoiceDto) {
    const newRecord = this.buyInvoiceRepository.create(buyInvoiceDto);
    return this.buyInvoiceRepository.save(newRecord);
  }

  async findAll() {
    return this.buyInvoiceRepository.find();
  }
}
