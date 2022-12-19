import { TransactionInfo } from '@sputnik-v2/common';

import { DaoConfig, DaoStatus } from '../types';
import { PolicyDtoV1 } from './policy.dto';

export interface DaoDto extends TransactionInfo {
  id: string;
  amount: string;
  config: DaoConfig;
  totalSupply: string;
  stakingContract: string;
  council: string[];
  councilSeats: number;
  accountIds: string[];
  policy: PolicyDtoV1;
  link: string;
  description: string;
  createdBy: string;
  metadata?: Record<string, any>;
  status?: DaoStatus;
  lastBountyId?: number;
  lastProposalId?: number;
  numberOfAssociates?: number;
  numberOfMembers?: number;
  numberOfGroups?: number;
  activeProposalCount?: number;
  totalProposalCount?: number;
  totalDaoFunds?: number;
  bountyCount?: number;
  nftCount?: number;
}
