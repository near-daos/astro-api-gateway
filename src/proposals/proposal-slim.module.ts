import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from './entities/proposal.entity';
import { ProposalService } from './proposal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal])
  ],
  providers: [ProposalService],
  exports: [ProposalService]
})
export class ProposalSlimModule {}
