import { Dao } from 'src/daos/entities/dao.entity';

/** Aggregator custom voting status.
 * Field value is updated on schedule based on the {@link Dao#proposalPeriod} field and DAO
 **/
export enum ProposalVoteStatus {
  Active = 'Active',
  Expired = 'Expired',
}
