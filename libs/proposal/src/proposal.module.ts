import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '@sputnik-v2/dao/entities';

import { Proposal } from './entities';
import { ProposalService } from './proposal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal, Role])],
  providers: [ProposalService],
  exports: [ProposalService],
})
export class ProposalModule {}
