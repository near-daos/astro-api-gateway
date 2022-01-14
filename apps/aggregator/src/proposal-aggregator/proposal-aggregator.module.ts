import { Module } from '@nestjs/common';

import { SputnikModule } from '@sputnik-v2/sputnikdao';
import { ProposalModule } from '@sputnik-v2/proposal';
import { DaoModule } from '@sputnik-v2/dao';

import { ProposalAggregatorService } from './proposal-aggregator.service';

@Module({
  imports: [SputnikModule, ProposalModule, DaoModule],
  providers: [ProposalAggregatorService],
  exports: [ProposalAggregatorService],
})
export class ProposalAggregatorModule {}
