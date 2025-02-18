import { Module } from '@nestjs/common';

import { BuyInvoiceService } from './services/buy-invoice.service'; // Assuming this service exists
import { BuyInvoiceRepository } from './repositories/repository/buy-invoice.repository';
import { BuyInvoiceController } from './controllers/buy-invoice.controller';
import { BuyInvoiceEntity } from './repositories/entities/buy-invoice.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [BuyInvoiceController],
  imports: [TypeOrmModule.forFeature([BuyInvoiceEntity])],
  providers: [BuyInvoiceRepository, BuyInvoiceService], // Add the appropriate providers for your module
  exports: [BuyInvoiceService], // Export any necessary services
})
export class BuyInvoiceModule {}
