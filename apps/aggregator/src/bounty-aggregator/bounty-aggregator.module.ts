import { Module } from '@nestjs/common';

import { SputnikModule } from '@sputnik-v2/sputnikdao';
import { BountyModule } from '@sputnik-v2/bounty';
import { TransactionModule } from '@sputnik-v2/transaction';

import { BountyAggregatorService } from './bounty-aggregator.service';

@Module({
  imports: [SputnikModule, BountyModule, TransactionModule],
  providers: [BountyAggregatorService],
  exports: [BountyAggregatorService],
})
export class BountyAggregatorModule {}
