import camelcaseKeys from 'camelcase-keys';
import { buildProposalAction } from 'src/proposals/dto/proposal-action.dto';
import { castProposalKind, ProposalDto } from 'src/proposals/dto/proposal.dto';
import { ProposalStatus } from 'src/proposals/types/proposal-status';
import { Action } from '../../proposals/types/action';
import {
  buildProposalId,
  calcProposalVotePeriodEnd,
  getBlockTimestamp,
} from 'src/utils';

export function castCreateProposal({
  transactionHash,
  signerId,
  proposal,
  dao,
  timestamp = getBlockTimestamp(),
}): ProposalDto {
  const kind = castProposalKind(proposal.kind);
  const proposalDto = {
    ...camelcaseKeys(proposal),
    id: buildProposalId(dao.id, dao.lastProposalId),
    proposalId: dao.lastProposalId,
    daoId: dao.id,
    dao: { id: dao.id },
    proposer: signerId,
    kind,
    type: kind.kind.type,
    status: ProposalStatus.InProgress,
    voteCounts: {},
    votes: {},
    votePeriodEnd: calcProposalVotePeriodEnd(
      { submissionTime: timestamp },
      dao,
    ),
    submissionTime: timestamp,
    transactionHash: transactionHash,
    createTimestamp: timestamp,
  };

  return {
    ...proposalDto,
    actions: [
      buildProposalAction(
        proposalDto,
        {
          accountId: signerId,
          transactionHash,
          blockTimestamp: timestamp,
        },
        Action.AddProposal,
      ),
    ],
  };
}

export function castActProposal({
  transactionHash,
  contractId,
  signerId,
  proposal,
  timestamp = getBlockTimestamp(),
  action,
}): ProposalDto {
  const proposalDto = {
    ...camelcaseKeys(proposal),
    id: buildProposalId(contractId, proposal.id),
    proposalId: proposal.id,
    daoId: contractId,
    dao: { id: contractId },
    kind: castProposalKind(proposal.kind),
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };

  return {
    ...proposalDto,
    actions: [
      buildProposalAction(
        proposalDto,
        { accountId: signerId, transactionHash, blockTimestamp: timestamp },
        action,
      ),
    ],
  };
}
