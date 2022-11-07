import { Module } from '@nestjs/common';

import { DraftProposalModule as DraftProposalModuleLib } from '@sputnik-v2/draft-proposal';
import { NearApiModule } from '@sputnik-v2/near-api';

import { DraftProposalController } from './draft-proposal.controller';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';

@Module({
  imports: [DraftProposalModuleLib, NearApiModule, FeatureFlagsModule],
  controllers: [DraftProposalController],
})
export class DraftProposalModule {}
