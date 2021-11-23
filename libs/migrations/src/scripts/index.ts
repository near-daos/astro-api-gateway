import { ProposalPurgeMigration } from './proposal-purge.migration';
import { ProposalActionsMigration } from './proposal-actions.migration';
import { DaoMetadataMigration } from './dao-metadata.migration';

export default [
  ProposalPurgeMigration,
  ProposalActionsMigration,
  DaoMetadataMigration,
];
