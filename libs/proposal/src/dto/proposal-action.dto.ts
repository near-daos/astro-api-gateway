import { buildProposalActionId } from '@sputnik-v2/utils';
import { Proposal, ProposalAction } from '..';

import { Action } from '../types/action';
import { ProposalDto } from './proposal.dto';

export class ProposalActionDto {
  id: string;
  proposalId: string;
  accountId: string;
  action: Action;
  transactionHash: string;
  timestamp: number;
}

export const buildProposalAction = (
  proposal: ProposalDto | Proposal,
  tx: {
    accountId: string;
    transactionHash: string;
    blockTimestamp: number;
  },
  action: Action,
): ProposalActionDto | ProposalAction => {
  const { accountId, transactionHash, blockTimestamp: timestamp } = tx;
  return {
    id: buildProposalActionId(proposal.id, accountId, action),
    accountId,
    proposalId: proposal.id,
    action: action,
    transactionHash,
    timestamp,
  };
};
