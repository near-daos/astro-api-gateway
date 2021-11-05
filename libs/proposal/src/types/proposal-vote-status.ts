import { Dao } from '@sputnik-v2/dao/entities';

/** Aggregator custom voting status.
 * Field value is updated on schedule based on the {@link Dao#proposalPeriod} field and DAO
 **/
export enum ProposalVoteStatus {
  Active = 'Active',
  Expired = 'Expired',
}
