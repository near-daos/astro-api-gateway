import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamodbModule } from '@sputnik-v2/dynamodb';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';
import { ProposalModule } from '@sputnik-v2/proposal';
import { TokenModule } from '@sputnik-v2/token';
import { BountyModule } from '@sputnik-v2/bounty';
import { DaoModule } from '@sputnik-v2/dao';

import { DaoStats } from './entities';
import { DaoStatsService } from './dao-stats.service';
import { DaoStatsDynamoService } from './dao-stats-dynamo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DaoStats]),
    DaoModule,
    ProposalModule,
    TokenModule,
    BountyModule,
    DynamodbModule,
    FeatureFlagsModule,
  ],
  providers: [DaoStatsService, DaoStatsDynamoService],
  exports: [DaoStatsService, DaoStatsDynamoService],
})
export class DaoStatsModule {}
