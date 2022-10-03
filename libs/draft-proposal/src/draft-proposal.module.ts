import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import { DaoApiModule } from '@sputnik-v2/dao-api';
import { OpenSearchModule } from '@sputnik-v2/opensearch';

import { DraftProposal, DraftProposalHistory } from './entities';
import { DraftProposalService } from './draft-proposal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [DraftProposal, DraftProposalHistory],
      DRAFT_DB_CONNECTION,
    ),
    DaoApiModule,
    OpenSearchModule,
  ],
  providers: [DraftProposalService],
  exports: [DraftProposalService],
})
export class DraftProposalModule {}
