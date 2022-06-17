import { registerAs } from '@nestjs/config';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import {
  DraftProposal,
  DraftProposalHistory,
} from '@sputnik-v2/draft-proposal/entities';
import { DraftHashtag } from '@sputnik-v2/draft-hashtag/entities';
import { DraftComment } from '@sputnik-v2/draft-comment/entities';
import * as fs from 'fs';

export default registerAs(`db_${DRAFT_DB_CONNECTION}`, () => {
  const certPath = process.env.DRAFT_DATABASE_CERT_PATH;
  return {
    type: 'mongodb',
    host: process.env.DRAFT_DATABASE_HOST,
    port: parseInt(process.env.DRAFT_DATABASE_PORT, 10),
    username: process.env.DRAFT_DATABASE_USERNAME,
    password: process.env.DRAFT_DATABASE_PASSWORD,
    ssl: !!certPath,
    sslValidate: false,
    sslCert: certPath ? fs.readFileSync(certPath).toString() : undefined,
    entities: [DraftProposal, DraftProposalHistory, DraftHashtag, DraftComment],
    synchronize: true,
  };
});
