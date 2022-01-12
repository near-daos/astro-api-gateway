import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalModule } from '@sputnik-v2/proposal';
import { TokenModule } from '@sputnik-v2/token';
import { BountyModule } from '@sputnik-v2/bounty';
import { DaoModule } from '@sputnik-v2/dao';

import { DaoStats } from './entities';
import { DaoStatsService } from './dao-stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DaoStats]),
    DaoModule,
    ProposalModule,
    TokenModule,
    BountyModule,
  ],
  providers: [DaoStatsService],
  exports: [DaoStatsService],
})
export class StatsModule {}
