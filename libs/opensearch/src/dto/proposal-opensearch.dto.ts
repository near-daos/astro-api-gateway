import { DaoConfig } from '@sputnik-v2/dao';
import {
  Proposal,
  ProposalKindAddBounty,
  ProposalKindAddMemberToRole,
  ProposalKindAddRemoveMemberFromRole,
  ProposalKindBountyDone,
  ProposalKindChangeConfig,
  ProposalKindChangePolicy,
  ProposalKindFunctionCall,
  ProposalKindSetStakingContract,
  ProposalKindTransfer,
  ProposalKindUpgradeRemote,
  ProposalKindUpgradeSelf,
  ProposalPermissions,
  ProposalPolicyLabel,
  ProposalStatus,
  ProposalType,
  ProposalVoteStatus,
} from '@sputnik-v2/proposal';
import { ActionCall } from '@sputnik-v2/sputnikdao';

import { BaseOpensearchDto } from './base-opensearch.dto';
import { DaoOpensearchDto, mapDaoToOpensearchDto } from './dao-opensearch.dto';

export class BountyProposalOpensearchDto {
  id: string;
  bountyId: number;
  description: string;
  token: string;
  amount: string;
  times: string;
  maxDeadline: string;
  numberOfClaims: number;
}

export class ProposalOpensearchDto extends BaseOpensearchDto {
  id: string;
  proposalId: number;
  daoId: string;
  dao?: DaoOpensearchDto;
  proposer: string;
  description: string;
  status: ProposalStatus;
  voteStatus: ProposalVoteStatus;
  type: ProposalType;
  policyLabel: ProposalPolicyLabel;
  submissionTime: number;
  votes: string;
  failure: Record<string, any>;
  votePeriodEnd: number;
  bountyDoneId: string;
  bountyClaimId: string;
  commentsCount: number;
  permissions?: ProposalPermissions;
  transactionHash: string;
  createTimestamp: number;

  // optional fields depending on the kind
  config?: DaoConfig;
  policy?: string;
  memberId?: string;
  role?: string;
  receiverId?: string;
  actions?: ActionCall[];
  hash?: string;
  methodName?: string;
  tokenId?: string;
  amount?: string;
  msg?: string;
  stakingId?: string;
  bounty?: BountyProposalOpensearchDto;
  bountyId?: string;

  public static getMappings(): any {
    const { mappings } = super.getMappings();
    const { properties } = mappings;

    return {
      mappings: {
        ...mappings,
        properties: {
          ...properties,
          createTimestamp: { type: 'long' },
          type: { type: 'text' },
          status: { type: 'text' },
          proposer: { type: 'text' },
          daoId: { type: 'text' },
          votes: { type: 'text' },
        },
      },
    };
  }
}

export function mapProposalToOpensearchDto(
  proposal: Proposal,
): ProposalOpensearchDto {
  const {
    id,
    proposalId,
    daoId,
    dao,
    proposer,
    description,
    status,
    voteStatus,
    type,
    kind,
    policyLabel,
    submissionTime,
    votes,
    failure,
    votePeriodEnd,
    bountyDoneId,
    bountyClaimId,
    commentsCount,
    permissions,
    transactionHash,
    createTimestamp,
  } = proposal;

  let dto: ProposalOpensearchDto = {
    id,
    name: id,
    accounts: [...new Set([proposer, ...Object.keys(votes)])].join(' '),
    proposalId,
    daoId,
    dao: dao ? mapDaoToOpensearchDto(dao) : null,
    proposer,
    description,
    status,
    voteStatus,
    type,
    policyLabel,
    submissionTime,
    votes: JSON.stringify(votes),
    failure,
    votePeriodEnd,
    bountyDoneId,
    bountyClaimId,
    commentsCount,
    permissions,
    transactionHash,
    createTimestamp,
    indexedBy: 'nodejs',
  };

  switch (type) {
    case ProposalType.AddBounty:
      const { bounty } = kind as ProposalKindAddBounty;
      const {
        id,
        bountyId,
        amount,
        bountyClaims,
        description,
        token,
        numberOfClaims,
        maxDeadline,
        times,
      } = bounty;

      dto = {
        ...dto,
        bounty: {
          id,
          amount,
          bountyClaims,
          bountyId,
          description,
          token,
          times,
          numberOfClaims,
          maxDeadline,
        } as BountyProposalOpensearchDto,
      };

      break;
    case ProposalType.ChangeConfig:
      const { config } = kind as ProposalKindChangeConfig;

      dto = { ...dto, config };

      break;
    case ProposalType.ChangePolicy:
      const { policy } = kind as ProposalKindChangePolicy;

      dto = { ...dto, policy: JSON.stringify(policy) };

      break;
    case ProposalType.AddMemberToRole:
    case ProposalType.RemoveMemberFromRole:
      const { memberId, role } = kind as
        | ProposalKindAddMemberToRole
        | ProposalKindAddRemoveMemberFromRole;

      dto = { ...dto, memberId, role };

      break;

    case ProposalType.FunctionCall:
      const { actions, receiverId } = kind as ProposalKindFunctionCall;

      dto = { ...dto, actions, receiverId };

      break;
    case ProposalType.UpgradeSelf: {
      const { hash } = kind as ProposalKindUpgradeSelf;

      dto = { ...dto, hash };

      break;
    }

    case ProposalType.UpgradeRemote: {
      const { hash, methodName, receiverId } =
        kind as ProposalKindUpgradeRemote;

      dto = { ...dto, hash, methodName, receiverId };

      break;
    }

    case ProposalType.Transfer: {
      const { amount, receiverId, msg, tokenId } = kind as ProposalKindTransfer;

      dto = { ...dto, amount, receiverId, tokenId, msg };

      break;
    }

    case ProposalType.SetStakingContract:
      const { stakingId } = kind as ProposalKindSetStakingContract;

      dto = { ...dto, stakingId };

      break;
    case ProposalType.BountyDone: {
      const { bountyId, receiverId } = kind as ProposalKindBountyDone;

      dto = { ...dto, bountyId, receiverId };

      break;
    }
  }

  return dto;
}
