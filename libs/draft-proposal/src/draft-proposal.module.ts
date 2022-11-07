import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import { DaoApiModule } from '@sputnik-v2/dao-api';
import { OpenSearchModule } from '@sputnik-v2/opensearch';
import { DynamodbModule } from '@sputnik-v2/dynamodb/dynamodb.module';

import { DraftProposal, DraftProposalHistory } from './entities';
import { MongoDraftProposalService } from './mongo-draft-proposal.service';
import { DynamoDraftProposalService } from '@sputnik-v2/draft-proposal/dynamo-draft-proposal.service';
import { DraftProposalServiceFacade } from '@sputnik-v2/draft-proposal/draft-proposal-service-facade';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [DraftProposal, DraftProposalHistory],
      DRAFT_DB_CONNECTION,
    ),
    DaoApiModule,
    OpenSearchModule,
    DynamodbModule,
    FeatureFlagsModule,
  ],
  providers: [
    MongoDraftProposalService,
    DynamoDraftProposalService,
    DraftProposalServiceFacade,
  ],
  exports: [
    MongoDraftProposalService,
    DynamoDraftProposalService,
    DraftProposalServiceFacade,
  ],
})
export class DraftProposalModule {}
