import camelcaseKeys from 'camelcase-keys';
import { castProposalKind, ProposalDto } from 'src/proposals/dto/proposal.dto';
import { ProposalStatus } from 'src/proposals/types/proposal-status';
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
