import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalModule } from '@sputnik-v2/proposal';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';
import { DynamodbModule } from '@sputnik-v2/dynamodb';

import { BountyService } from './bounty.service';
import { BountyContextService } from './bounty-context.service';
import { Bounty, BountyContext } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bounty, BountyContext]),
    ProposalModule,
    FeatureFlagsModule,
    DynamodbModule,
  ],
  providers: [BountyService, BountyContextService],
  exports: [BountyService, BountyContextService],
})
export class BountyModule {}
