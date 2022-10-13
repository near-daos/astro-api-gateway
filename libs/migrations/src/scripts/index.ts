import { ProposalActionsMigration } from './proposal-actions.migration';
import { TokenIdsMigration } from './token-ids.migration';
import { DaoMetadataMigration } from './dao-metadata.migration';
import { BountyClaimEndTimeMigration } from './bounty-claim-end-time';
import { ProposalVoteMigration } from './proposal-vote.migration';
import { NotificationSettingsMigration } from './notification-settings.migration';
import { BountyContextMigration } from './bounty-context.migration';
import { CommentProposalContextMigration } from './comment-proposal-context.migration';
import { DaoGroupFieldsMigration } from './dao-goup-fields.migration';
import { ProposalClaimIdMigration } from './proposal-claim-id.migration';
import { DaoVersionsMigration } from './dao-version.migration';
import { SharedProposalTemplateMigration } from './shared-proposal-template.migration';
import { OpensearchIndexMigration } from './opensearch-index.migration';
import { CommentsCountMigration } from './comments-count.migration';
import { DynamoDaoTableMigration } from './dynamo-dao-table.migration';
import { OpensearchIndexMappingMigration } from './opensearch-index-mapping.migration';

export default [
  ProposalActionsMigration,
  TokenIdsMigration,
  DaoMetadataMigration,
  BountyClaimEndTimeMigration,
  ProposalVoteMigration,
  NotificationSettingsMigration,
  BountyContextMigration,
  CommentProposalContextMigration,
  DaoGroupFieldsMigration,
  ProposalClaimIdMigration,
  DaoVersionsMigration,
  SharedProposalTemplateMigration,
  OpensearchIndexMigration,
  CommentsCountMigration,
  DynamoDaoTableMigration,
  OpensearchIndexMappingMigration,
];
