import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalModule } from '@sputnik-v2/proposal/proposal.module';
import { TokenModule } from '@sputnik-v2/token';
import { NearApiModule } from '@sputnik-v2/near-api';
import { DynamodbModule } from '@sputnik-v2/dynamodb';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';

import { Dao, DaoVersion, Policy } from './entities';
import { DaoService } from './dao.service';
import { Delegation } from './entities/delegation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dao, Policy, DaoVersion, Delegation]),
    ProposalModule,
    TokenModule,
    NearApiModule,
    FeatureFlagsModule,
    DynamodbModule,
  ],
  providers: [DaoService],
  exports: [DaoService],
})
export class DaoModule {}
