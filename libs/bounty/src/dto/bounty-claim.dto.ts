import { TransactionInfo } from '@sputnik-v2/common';

import { BountyDto } from './bounty.dto';

export class BountyClaimDto extends TransactionInfo {
  bounty: BountyDto;
  accountId: string;
  /// Start time of the claim.
  startTime: string;
  /// Deadline specified by claimer.
  deadline: string;
  endTime: string;
  /// Completed?
  completed: boolean;
}
