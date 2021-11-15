import { TransactionInfo } from '@sputnik-v2/common';

import { DaoConfig } from '../types/dao-config';
import { PolicyDto } from './policy.dto';

export interface DaoDto extends TransactionInfo {
  id: string;
  amount: number;
  config: DaoConfig;
  totalSupply: string;
  stakingContract: string;
  council: string[];
  policy: PolicyDto;
  link: string;
  description: string;
  createdBy: string;
}
