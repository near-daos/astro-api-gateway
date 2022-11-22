import camelcaseKeys from 'camelcase-keys';
import {
  buildProposalAction,
  castProposalKind,
  ProposalDto,
} from '@sputnik-v2/proposal/dto';
import {
  Action,
  ProposalStatus,
  ProposalType,
  ProposalTypeToPolicyLabel,
  ProposalVoteStatus,
} from '@sputnik-v2/proposal/types';

import {
  buildBountyId,
  buildProposalId,
  calcProposalVotePeriodEnd,
} from '@sputnik-v2/utils';

export function castCreateProposal({
  transactionHash,
  signerId,
  proposal,
  dao,
  timestamp,
}): ProposalDto {
  const kind = castProposalKind(proposal.kind);
  const proposalDto = {
    ...camelcaseKeys(proposal),
    id: buildProposalId(dao.id, proposal.id),
    proposalId: proposal.id,
    daoId: dao.id,
    dao: { id: dao.id },
    proposer: signerId,
    kind,
    type: kind.kind.type,
    policyLabel: ProposalTypeToPolicyLabel[kind.kind.type],
    bountyDoneId:
      kind.kind.type === ProposalType.BountyDone
        ? buildBountyId(dao.id, kind.kind.bountyId)
        : null,
    status: ProposalStatus.InProgress,
    voteStatus: ProposalVoteStatus.Active,
    voteCounts: {},
    votes: {},
    votePeriodEnd: calcProposalVotePeriodEnd(
      { submissionTime: proposal.submission_time },
      dao,
    ),
    submissionTime: proposal.submission_time,
    transactionHash: transactionHash,
    createTimestamp: timestamp,
  };

  return {
    ...proposalDto,
    actions: [
      buildProposalAction(
        proposalDto.id,
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
  timestamp,
  action,
}): ProposalDto {
  const kind = castProposalKind(proposal.kind);
  const proposalDto = {
    ...camelcaseKeys(proposal),
    id: buildProposalId(contractId, proposal.id),
    proposalId: proposal.id,
    daoId: contractId,
    dao: { id: contractId },
    type: kind.kind.type,
    kind,
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };

  return {
    ...proposalDto,
    actions: [
      buildProposalAction(
        proposalDto.id,
        { accountId: signerId, transactionHash, blockTimestamp: timestamp },
        action,
      ),
    ],
  };
}
