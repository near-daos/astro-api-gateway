import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalModule } from '@sputnik-v2/proposal';

import { Dao, Policy } from './entities';
import { DaoService } from './dao.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dao, Policy]), ProposalModule],
  providers: [DaoService],
  exports: [DaoService],
})
export class DaoModule {}
