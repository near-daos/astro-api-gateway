import { TransactionInfo } from 'src/common/dto/TransactionInfo';
import { DaoConfig } from '../types/dao-config';
import { DaoStatus } from '../types/dao-status';
import { PolicyDto } from './policy.dto';

export interface DaoDto extends TransactionInfo {
  id: string;
  amount: string;
  config: DaoConfig;
  totalSupply: string;
  stakingContract: string;
  council: string[];
  policy: PolicyDto;
  link: string;
  description: string;
  status: DaoStatus;
  createdBy: string;
}
