import { SputnikDaoConfig, SputnikDaoPolicy } from '@sputnik-v2/near-api';

export interface DaoInfo {
  config: SputnikDaoConfig;
  policy: SputnikDaoPolicy;
  totalSupply: string;
  lastBountyId: number;
  lastProposalId: number;
  stakingContract: string;
  amount: string;
}
