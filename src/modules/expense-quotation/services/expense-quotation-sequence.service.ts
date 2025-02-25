import { Injectable } from '@nestjs/common';
import { AppConfigService } from 'src/common/app-config/services/app-config.service';
import { ExpenseQuotationSequentialNotFoundException } from '../errors/expense-quotation.sequential.error';
import { AppConfigEntity } from 'src/common/app-config/repositories/entities/app-config.entity';
import { EventsGateway } from 'src/common/gateways/events/events.gateway';
import { UpdateExpenseQuotationSequenceDto } from '../dtos/expense-quotation-seqence.update.dto';
import { formSequential } from 'src/utils/sequence.utils';
import { WSRoom } from 'src/app/enums/ws-room.enum';

@Injectable()
export class ExpenseQuotationSequenceService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly wsGateway: EventsGateway,
  ) {}

  async get(): Promise<AppConfigEntity> {
    const sequence =
      await this.appConfigService.findOneByName('quotation_sequence');
    if (!sequence) {
      throw new ExpenseQuotationSequentialNotFoundException();
    }
    return sequence;
  }

  async set(
    updateExpenseQuotationSequenceDto: UpdateExpenseQuotationSequenceDto,
  ): Promise<AppConfigEntity> {
    const sequence = await this.get();
    const updatedSequence = await this.appConfigService.update(sequence.id, {
      value: updateExpenseQuotationSequenceDto,
    });
    return updatedSequence;
  }

  async getSequential(): Promise<string> {
    const sequence = await this.get();
    this.set({ ...sequence.value, next: sequence.value.next + 1 });
    this.wsGateway.sendToRoom(
      WSRoom.EXPENSE_INVOICE_SEQUENCE,
      'quotation-sequence-updated',
      {
        value: sequence.value.next + 1,
      },
    );
    return formSequential(
      sequence.value.prefix,
      sequence.value.dynamicSequence,
      sequence.value.next,
    );
  }
}
