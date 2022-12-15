import { TransactionInfo } from '@sputnik-v2/common';
import { DaoStatus } from '@sputnik-v2/dao/types';

import { DaoConfig } from '../types/dao-config';
import { DaoDto } from './dao.dto';
import { PolicyDtoV1 } from './policy.dto';

export class SputnikDaoDto extends TransactionInfo implements DaoDto {
  id: string;
  config: DaoConfig;
  totalSupply: string;
  lastBountyId: number;
  lastProposalId: number;
  stakingContract: string;
  policy: PolicyDtoV1;
  status?: DaoStatus;
  amount: string;
  council: string[];
  councilSeats: number;
  numberOfMembers: number;
  numberOfGroups: number;
  numberOfAssociates: number;
  accountIds: string[];
  link: string;
  description: string;
  createdBy: string;
  metadata?: Record<string, any>;
}
