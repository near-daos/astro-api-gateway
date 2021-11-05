import camelcaseKeys from 'camelcase-keys';
import { castProposalKind, ProposalDto } from '@sputnik-v2/proposal/dto';
import { ProposalStatus } from '@sputnik-v2/proposal/types';
import {
  buildProposalId,
  calcProposalVotePeriodEnd,
  getBlockTimestamp,
} from '@sputnik-v2/utils';

export function castCreateProposal({
  transactionHash,
  signerId,
  proposal,
  dao,
  timestamp = getBlockTimestamp(),
}): ProposalDto {
  const proposalDto = {
    ...camelcaseKeys(proposal),
    id: buildProposalId(dao.id, dao.lastProposalId),
    proposalId: dao.lastProposalId,
    daoId: dao.id,
    dao: { id: dao.id },
    proposer: signerId,
    kind: castProposalKind(proposal.kind),
    status: ProposalStatus.InProgress,
    voteCounts: {},
    votes: {},
    submissionTime: timestamp,
    transactionHash: transactionHash,
    createTimestamp: timestamp,
  };

  return {
    ...proposalDto,
    votePeriodEnd: calcProposalVotePeriodEnd(proposalDto, dao),
  };
}

export function castActProposal({
  transactionHash,
  contractId,
  proposal,
  timestamp = getBlockTimestamp(),
}): ProposalDto {
  return {
    ...camelcaseKeys(proposal),
    id: buildProposalId(contractId, proposal.id),
    proposalId: proposal.id,
    daoId: contractId,
    dao: { id: contractId },
    kind: castProposalKind(proposal.kind),
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };
}
