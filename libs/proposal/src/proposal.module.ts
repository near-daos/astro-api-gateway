import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dao, Role, Delegation } from '@sputnik-v2/dao/entities';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';
import { DynamodbModule } from '@sputnik-v2/dynamodb';

import { Proposal } from './entities';
import { ProposalService } from './proposal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal, Role, Delegation, Dao]),
    FeatureFlagsModule,
    DynamodbModule,
  ],
  providers: [ProposalService],
  exports: [ProposalService],
})
export class ProposalModule {}
