import { Module } from '@nestjs/common';

import { SputnikModule } from '@sputnik-v2/sputnikdao';
import { DaoModule } from '@sputnik-v2/dao';
import { ProposalModule } from '@sputnik-v2/proposal';

import { DaoAggregatorService } from './dao-aggregator.service';

@Module({
  imports: [SputnikModule, DaoModule, ProposalModule],
  providers: [DaoAggregatorService],
  exports: [DaoAggregatorService],
})
export class DaoAggregatorModule {}
