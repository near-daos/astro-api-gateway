import { TransactionInfo } from '@sputnik-v2/common';
import { BountyClaimDto } from './bounty-claim.dto';

export class BountyDto extends TransactionInfo {
  id: string;
  daoId: string;
  bountyId: number;
  proposalId: string;
  proposalIndex: number;
  description: string;
  /// Token the bounty will be paid out.
  token: string;
  /// Amount to be paid out.
  amount: string;
  /// How many times this bounty can be done.
  times: number;
  /// Max deadline from claim that can be spend on this bounty.
  maxDeadline: string;
  numberOfClaims: number;
  bountyClaims: BountyClaimDto[];
}
