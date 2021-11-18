import { Module } from '@nestjs/common';

import { NearApiModule } from '@sputnik-v2/near-api';
import { BountyModule } from '@sputnik-v2/bounty';
import { TransactionModule } from '@sputnik-v2/transaction';

import { BountyAggregatorService } from './bounty-aggregator.service';

@Module({
  imports: [NearApiModule, BountyModule, TransactionModule],
  providers: [BountyAggregatorService],
  exports: [BountyAggregatorService],
})
export class BountyAggregatorModule {}
