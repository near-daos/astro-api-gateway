import { Module } from '@nestjs/common';
import { EventModule } from '@sputnik-v2/event';
import { TransactionHandlerModule } from '@sputnik-v2/transaction-handler';

import { AggregatorController } from './aggregator.controller';
import { NearModule } from '../near/near.module';

@Module({
  imports: [NearModule, EventModule, TransactionHandlerModule],
  controllers: [AggregatorController],
})
export class AggregatorModule {}
