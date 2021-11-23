import { TransactionInfo } from '@sputnik-v2/common';

import { DaoConfig } from '../types/dao-config';
import { DaoDto } from './dao.dto';
import { PolicyDto } from './policy.dto';

export class SputnikDaoDto extends TransactionInfo implements DaoDto {
  id: string;
  config: DaoConfig;
  totalSupply: string;
  lastBountyId: number;
  lastProposalId: number;
  stakingContract: string;
  policy: PolicyDto;
  amount: number;
  council: string[];
  councilSeats: number;
  numberOfAssociates: number = 0;
  link: string;
  description: string;
  createdBy: string;
  metadata?: string;
}
