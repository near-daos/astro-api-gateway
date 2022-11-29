import { buildProposalActionId } from '@sputnik-v2/utils';
import { ProposalAction } from '..';

import { Action } from '../types/action';

export class ProposalActionDto {
  id: string;
  proposalId: string;
  accountId: string;
  action: Action;
  transactionHash: string;
  timestamp: string; // nanoseconds
}

export const buildProposalAction = (
  proposalId: string,
  tx: {
    accountId: string;
    transactionHash: string;
    blockTimestamp: string; // nanoseconds
  },
  action: Action,
): ProposalActionDto | ProposalAction => {
  const { accountId, transactionHash, blockTimestamp: timestamp } = tx;
  return {
    id: buildProposalActionId(proposalId, accountId, action),
    accountId,
    proposalId: proposalId,
    action: action,
    transactionHash,
    timestamp,
  };
};
