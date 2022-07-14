import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import { DraftHashtagModule } from '@sputnik-v2/draft-hashtag';
import { DaoApiModule } from '@sputnik-v2/dao-api';

import { DraftProposal, DraftProposalHistory } from './entities';
import { DraftProposalService } from './draft-proposal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [DraftProposal, DraftProposalHistory],
      DRAFT_DB_CONNECTION,
    ),
    DraftHashtagModule,
    DaoApiModule,
  ],
  providers: [DraftProposalService],
  exports: [DraftProposalService],
})
export class DraftProposalModule {}
