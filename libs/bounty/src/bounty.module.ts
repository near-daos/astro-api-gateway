import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BountyDynamoService } from '@sputnik-v2/bounty/bounty-dynamo.service';
import { DaoModule } from '@sputnik-v2/dao';
import { DynamodbModule } from '@sputnik-v2/dynamodb';
import { ProposalModule } from '@sputnik-v2/proposal';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';

import { BountyService } from './bounty.service';
import { BountyContextService } from './bounty-context.service';
import { Bounty, BountyContext } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bounty, BountyContext]),
    DaoModule,
    ProposalModule,
    FeatureFlagsModule,
    DynamodbModule,
  ],
  providers: [BountyService, BountyContextService, BountyDynamoService],
  exports: [BountyService, BountyContextService, BountyDynamoService],
})
export class BountyModule {}
