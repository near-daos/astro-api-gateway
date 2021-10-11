import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/daos/entities/role.entity';
import { Proposal } from './entities/proposal.entity';
import { ProposalService } from './proposal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal, Role])],
  providers: [ProposalService],
  exports: [ProposalService],
})
export class ProposalSlimModule {}
