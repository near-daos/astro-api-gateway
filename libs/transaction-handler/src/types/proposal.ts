import { Dao } from '@sputnik-v2/dao';
import { DaoModel, PartialEntity, ProposalModel } from '@sputnik-v2/dynamodb';
import { SputnikDaoProposalOutput } from '@sputnik-v2/near-api';
import { Proposal, ProposalActionDto } from '@sputnik-v2/proposal';
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
import { Vote } from '@sputnik-v2/sputnikdao';

import {
  arrayUniqueBy,
  buildBountyId,
  buildProposalId,
  calcProposalVotePeriodEnd,
} from '@sputnik-v2/utils';

export function castCreateProposal(
  transactionHash: string,
  signerId: string,
  proposal: SputnikDaoProposalOutput,
  dao: Dao | PartialEntity<DaoModel>,
  timestamp: string,
): ProposalDto {
  const kind = castProposalKind(proposal.kind);
  const id = buildProposalId(dao.id, proposal.id);
  return {
    id,
    proposalId: proposal.id,
    daoId: dao.id,
    proposer: signerId,
    description: proposal.description,
    kind,
    type: kind.kind.type,
    policyLabel: ProposalTypeToPolicyLabel[kind.kind.type],
    bountyDoneId:
      kind.kind.type === ProposalType.BountyDone
        ? buildBountyId(dao.id, kind.kind.bountyId)
        : null,
    // TODO: set current status from proposal output
    status: ProposalStatus.InProgress,
    voteStatus: ProposalVoteStatus.Active,
    voteCounts: {},
    votes: {},
    votePeriodEnd: calcProposalVotePeriodEnd(
      proposal.submission_time,
      dao.policy.proposalPeriod,
    ),
    submissionTime: proposal.submission_time,
    transactionHash: transactionHash,
    createTimestamp: timestamp,
    actions: [
      buildProposalAction(
        id,
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

export function castActProposal(
  transactionHash: string,
  daoId: string,
  signerId: string,
  proposal: Proposal | PartialEntity<ProposalModel>,
  proposalData: SputnikDaoProposalOutput,
  timestamp: string,
  action: Action,
): ProposalDto {
  const kind = castProposalKind(proposalData.kind);
  return {
    id: proposal.id,
    daoId: daoId,
    proposalId: proposalData.id,
    proposer: proposalData.proposer,
    description: proposalData.description,
    kind,
    type: kind.type,
    status: proposalData.status as unknown as ProposalStatus,
    votes: proposalData.votes as unknown as Record<string, Vote>,
    voteCounts: proposalData.vote_counts,
    voteStatus: proposal.voteStatus,
    votePeriodEnd: proposal.votePeriodEnd,
    submissionTime: proposalData.submission_time,
    transactionHash: proposal.transactionHash,
    updateTransactionHash: transactionHash,
    createTimestamp: proposal.createTimestamp,
    updateTimestamp: timestamp,
    actions: arrayUniqueBy<ProposalActionDto>(
      [
        ...proposal.actions,
        buildProposalAction(
          proposal.id,
          { accountId: signerId, transactionHash, blockTimestamp: timestamp },
          action,
        ),
      ],
      'id',
    ),
  };
}
