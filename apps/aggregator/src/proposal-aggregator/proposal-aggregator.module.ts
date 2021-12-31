import { Module } from '@nestjs/common';

import { SputnikModule } from '@sputnik-v2/sputnikdao';
import { ProposalModule } from '@sputnik-v2/proposal';

import { ProposalAggregatorService } from './proposal-aggregator.service';

@Module({
  imports: [SputnikModule, ProposalModule],
  providers: [ProposalAggregatorService],
  exports: [ProposalAggregatorService],
})
export class ProposalAggregatorModule {}
