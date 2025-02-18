import { Module } from '@nestjs/common';
import { BuyQuotationService } from './services/buy-quotation.service'; // Assuming this service exists
import { BuyQuotationRepository } from './repositories/repository/buy-quotation.repository';
import { BuyQuotationController } from './controller/buy-quotation.controller';
import { BuyQuotationEntity } from './repositories/entities/buy-quotation.entity';

@Module({
  controllers: [BuyQuotationController],
  imports: [BuyQuotationEntity],
  providers: [BuyQuotationRepository, BuyQuotationService], // Add the appropriate providers for your module
  exports: [BuyQuotationService], // Export any necessary services
})
export class BuyQuotationModule {}
