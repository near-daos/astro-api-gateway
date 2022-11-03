import { Module } from '@nestjs/common';

import { DraftProposalModule as DraftProposalModuleLib } from '@sputnik-v2/draft-proposal';
import { NearApiModule } from '@sputnik-v2/near-api';

import { DraftProposalController } from './draft-proposal.controller';

@Module({
  imports: [DraftProposalModuleLib, NearApiModule],
  controllers: [DraftProposalController],
})
export class DraftProposalModule {}
