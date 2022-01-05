import { Module } from '@nestjs/common';
import { EventModule } from '@sputnik-v2/event';

import { AggregatorController } from './aggregator.controller';
import { NearModule } from '../near/near.module';

@Module({
  imports: [NearModule, EventModule],
  controllers: [AggregatorController],
})
export class AggregatorModule {}
