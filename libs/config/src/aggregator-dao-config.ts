import { registerAs } from '@nestjs/config';
import { default as configuration } from './configuration';
import { default as database } from './database';
import databaseNearIndexer from './database-near-indexer';
import { default as nearConfig } from './near-config';

export { default as validate } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';

const aggregator = registerAs('aggregator-dao', () => ({
  pollingInterval: parseInt(process.env.DAO_POLLING_INTERVAL, 10),
  proposalVoteStatusUpdateInterval: parseInt(
    process.env.PROPOSAL_VOTE_STATUS_UPDATE_INTERVAL,
  ),
}));

export default [
  configuration,
  database,
  nearConfig,
  databaseNearIndexer,
  aggregator,
];
