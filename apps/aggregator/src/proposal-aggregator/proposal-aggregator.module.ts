import { Module } from '@nestjs/common';

import { NearApiModule } from '@sputnik-v2/near-api';
import { ProposalModule } from '@sputnik-v2/proposal';

import { ProposalAggregatorService } from './proposal-aggregator.service';

@Module({
  imports: [NearApiModule, ProposalModule],
  providers: [ProposalAggregatorService],
  exports: [ProposalAggregatorService],
})
export class ProposalAggregatorModule {}
