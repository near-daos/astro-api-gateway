import { Module } from '@nestjs/common';
import { EventModule } from '@sputnik-v2/event';
import { NearApiModule } from '@sputnik-v2/near-api';
import { TransactionHandlerModule } from '@sputnik-v2/transaction-handler';

import { AggregatorController } from './aggregator.controller';

@Module({
  imports: [NearApiModule, EventModule, TransactionHandlerModule],
  controllers: [AggregatorController],
})
export class AggregatorModule {}
