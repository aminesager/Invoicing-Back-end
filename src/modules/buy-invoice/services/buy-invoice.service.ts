import { Injectable } from '@nestjs/common';
import { BuyInvoiceDto } from '../dtos/buy-invoice.dto';
import { BuyInvoiceRepository } from '../repositories/repository/buy-invoice.repository';

@Injectable()
export class BuyInvoiceService {
  constructor(private readonly buyInvoiceRepository: BuyInvoiceRepository) {}

  async create(buyInvoiceDto: BuyInvoiceDto) {
    return this.buyInvoiceRepository.create(buyInvoiceDto);
  }

  async findAll() {
    return this.buyInvoiceRepository.findAll();
  }
}
