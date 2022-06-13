import { registerAs } from '@nestjs/config';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import {
  DraftProposal,
  DraftProposalHistory,
} from '@sputnik-v2/draft-proposal/entities';
import { DraftHashtag } from '@sputnik-v2/draft-hashtag/entities';
import { DraftComment } from '@sputnik-v2/draft-comment/entities';

export default registerAs(`db_${DRAFT_DB_CONNECTION}`, () => ({
  type: 'mongodb',
  url: process.env.DRAFT_DATABASE_CONNECTION_URL,
  entities: [DraftProposal, DraftProposalHistory, DraftHashtag, DraftComment],
  synchronize: true,
}));
