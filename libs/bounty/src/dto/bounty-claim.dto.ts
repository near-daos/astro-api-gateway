import { TransactionInfo } from '@sputnik-v2/common';

export class BountyClaimDto extends TransactionInfo {
  id: string;
  bountyId: string;
  accountId: string;
  /// Start time of the claim.
  startTime: string;
  /// Deadline specified by claimer.
  deadline: string;
  endTime: string;
  /// Completed?
  completed: boolean;
}
