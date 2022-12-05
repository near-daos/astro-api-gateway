import { BountyClaimEndTimeMigration } from './bounty-claim-end-time';
import { CommentProposalContextMigration } from './comment-proposal-context.migration';
import { CommentsCountMigration } from './comments-count.migration';
import { DaoCountsMigration } from './dao-counts.migration';
import { DaoGroupFieldsMigration } from './dao-goup-fields.migration';
import { DaoMetadataMigration } from './dao-metadata.migration';
import { DaoVersionsMigration } from './dao-version.migration';
import { DynamoCheckMigration } from './dynamo-check.migration';
import { DynamoDataMigration } from './dynamo-data.migration';
import { DynamoTableMigration } from './dynamo-table.migration';
import { NotificationSettingsMigration } from './notification-settings.migration';
import { OpensearchIndexMappingMigration } from './opensearch-index-mapping.migration';
import { ProposalActionsMigration } from './proposal-actions.migration';
import { ProposalClaimIdMigration } from './proposal-claim-id.migration';
import { ProposalVoteMigration } from './proposal-vote.migration';
import { SharedProposalTemplateMigration } from './shared-proposal-template.migration';
import { TokenIdsMigration } from './token-ids.migration';

export default [
  BountyClaimEndTimeMigration,
  CommentProposalContextMigration,
  CommentsCountMigration,
  DaoCountsMigration,
  DaoGroupFieldsMigration,
  DaoMetadataMigration,
  DaoVersionsMigration,
  DynamoCheckMigration,
  DynamoDataMigration,
  DynamoTableMigration,
  NotificationSettingsMigration,
  OpensearchIndexMappingMigration,
  ProposalActionsMigration,
  ProposalClaimIdMigration,
  ProposalVoteMigration,
  SharedProposalTemplateMigration,
  TokenIdsMigration,
];
