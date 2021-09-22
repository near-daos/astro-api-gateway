import { TransactionInfo } from 'src/common/dto/TransactionInfo';
import { DaoConfig } from '../types/dao-config';
import { DaoStatus } from '../types/dao-status';
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
  numberOfMembers: number = 0;
  link: string;
  description: string;
  status: DaoStatus;
}
