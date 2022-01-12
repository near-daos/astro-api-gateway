import { Module } from '@nestjs/common';

import { DaoModule } from '@sputnik-v2/dao';
import { StatsModule } from '@sputnik-v2/stats';

import { StatsAggregatorService } from './stats-aggregator.service';

@Module({
  imports: [StatsModule, DaoModule],
  providers: [StatsAggregatorService],
  exports: [StatsAggregatorService],
})
export class StatsAggregatorModule {}
