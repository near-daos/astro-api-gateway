import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalModule } from '@sputnik-v2/proposal/proposal.module';
import { TokenModule } from '@sputnik-v2/token';

import { Dao, Policy } from './entities';
import { DaoService } from './dao.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dao, Policy]),
    ProposalModule,
    TokenModule,
  ],
  providers: [DaoService],
  exports: [DaoService],
})
export class DaoModule {}
