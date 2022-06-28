import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalModule } from '@sputnik-v2/proposal/proposal.module';
import { TokenModule } from '@sputnik-v2/token';
import { NearApiModule } from '@sputnik-v2/near-api';

import { Dao, DaoVersion, Policy } from './entities';
import { DaoService } from './dao.service';
import { Delegation } from './entities/delegation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dao, Policy, DaoVersion, Delegation]),
    ProposalModule,
    TokenModule,
    NearApiModule,
  ],
  providers: [DaoService],
  exports: [DaoService],
})
export class DaoModule {}
