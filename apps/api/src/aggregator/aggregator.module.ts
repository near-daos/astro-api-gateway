import { Module } from '@nestjs/common';
import { EventModule } from '@sputnik-v2/event';

import { AggregatorController } from './aggregator.controller';

@Module({
  imports: [EventModule],
  controllers: [AggregatorController],
})
export class AggregatorModule {}
