import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoDynamoService } from '@sputnik-v2/dao/dao-dynamo.service';
import { ProposalModule } from '@sputnik-v2/proposal/proposal.module';
import { TokenModule } from '@sputnik-v2/token';
import { NearApiModule } from '@sputnik-v2/near-api';
import { DynamodbModule } from '@sputnik-v2/dynamodb';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';

import { Dao, DaoVersion, Delegation, Policy } from './entities';
import { DaoService } from './dao.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dao, Policy, DaoVersion, Delegation]),
    ProposalModule,
    TokenModule,
    NearApiModule,
    FeatureFlagsModule,
    DynamodbModule,
  ],
  providers: [DaoService, DaoDynamoService],
  exports: [DaoService, DaoDynamoService],
})
export class DaoModule {}
