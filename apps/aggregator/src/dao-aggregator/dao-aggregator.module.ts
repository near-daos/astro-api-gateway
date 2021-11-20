import { Module } from '@nestjs/common';

import { NearApiModule } from '@sputnik-v2/near-api';
import { DaoModule } from '@sputnik-v2/dao';

import { DaoAggregatorService } from './dao-aggregator.service';

@Module({
  imports: [NearApiModule, DaoModule],
  providers: [DaoAggregatorService],
  exports: [DaoAggregatorService],
})
export class DaoAggregatorModule {}
