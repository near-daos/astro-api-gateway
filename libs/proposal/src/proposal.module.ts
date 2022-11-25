import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dao, Role, Delegation } from '@sputnik-v2/dao/entities';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';
import { DynamodbModule } from '@sputnik-v2/dynamodb/dynamodb.module';

import { Proposal } from './entities';
import { ProposalService } from './proposal.service';
import { ProposalDynamoService } from './proposal-dynamo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal, Role, Delegation, Dao]),
    FeatureFlagsModule,
    DynamodbModule,
  ],
  providers: [ProposalService, ProposalDynamoService],
  exports: [ProposalService, ProposalDynamoService],
})
export class ProposalModule {}
