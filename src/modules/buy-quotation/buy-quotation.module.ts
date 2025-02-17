import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyQuotationService } from './services/buy-quotation.service'; // Assuming this service exists
import { BuyQuotationEntity } from './repositories/entities/buy-quotation.entity'; // Assuming you have this entity
import { TypeOrmConfigService } from 'src/common/database/services/database-config.service'; // Adjust the path if necessary

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([BuyQuotationEntity]), // Include your entity here
  ],
  controllers: [],
  providers: [BuyQuotationService], // Add the appropriate providers for your module
  exports: [BuyQuotationService], // Export any necessary services
})
export class BuyQuotationModule {}
