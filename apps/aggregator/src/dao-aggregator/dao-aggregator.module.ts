import { Module } from '@nestjs/common';

import { SputnikModule } from '@sputnik-v2/sputnikdao';
import { DaoModule } from '@sputnik-v2/dao';

import { DaoAggregatorService } from './dao-aggregator.service';

@Module({
  imports: [SputnikModule, DaoModule],
  providers: [DaoAggregatorService],
  exports: [DaoAggregatorService],
})
export class DaoAggregatorModule {}
