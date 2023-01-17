import { Retryable } from 'typescript-retry-decorator';
import { Contract } from 'near-api-js/lib/contract';
import { Account } from 'near-api-js/lib/account';
import { BlockId } from 'near-api-js/lib/providers/provider';
import { BaseContract, BlockQuery } from './base.contract';

export interface SputnikDaoConfig {
  name: string;
  purpose: string;
  metadata: string;
}

export enum SputnikDaoVotePolicyWeightKind {
  TokenWeight = 'TokenWeight',
  RoleWeight = 'RoleWeight',
}

export type SputnikDaoVotePolicyWeightOrRatio = string | [number, number];

export interface SputnikDaoVotePolicy {
  weight_kind: SputnikDaoVotePolicyWeightKind;
  quorum: string;
  threshold: SputnikDaoVotePolicyWeightOrRatio;
}

export interface SputnikDaoRoleKindGroup {
  Group: string[];
}

export interface SputnikDaoRoleKindMember {
  Member: number;
}

export type SputnikDaoRoleKindEveryone = 'Everyone';

export type SputnikDaoRoleKind =
  | SputnikDaoRoleKindGroup
  | SputnikDaoRoleKindMember
  | SputnikDaoRoleKindEveryone;

export const isSputnikDaoRoleKindGroup = (
  kind: SputnikDaoRoleKind,
): kind is SputnikDaoRoleKindGroup =>
  (kind as SputnikDaoRoleKindGroup).Group !== undefined;

export const isSputnikDaoRoleKindMember = (
  kind: SputnikDaoRoleKind,
): kind is SputnikDaoRoleKindMember =>
  (kind as SputnikDaoRoleKindMember).Member !== undefined;

export const isSputnikDaoRoleKindEveryone = (
  kind: SputnikDaoRoleKind,
): kind is SputnikDaoRoleKindEveryone =>
  (kind as SputnikDaoRoleKindEveryone) === 'Everyone';

export interface SputnikDaoRole {
  name: string;
  kind: SputnikDaoRoleKind;
  permissions: string[];
  vote_policy: Record<string, SputnikDaoVotePolicy>;
}

export type SputnikDaoPolicyV1 = string[]; // council

export interface SputnikDaoPolicyV2 {
  roles: SputnikDaoRole[];
  default_vote_policy: SputnikDaoVotePolicy;
  proposal_bond: string;
  proposal_period: string;
  bounty_bond: string;
  bounty_forgiveness_period: string;
}

export type SputnikDaoPolicy = SputnikDaoPolicyV1 | SputnikDaoPolicyV2;

export const isSputnikDaoPolicyV2 = (
  policy: SputnikDaoPolicy,
): policy is SputnikDaoPolicyV2 =>
  (policy as SputnikDaoPolicyV2).roles !== undefined;

export interface SputnikDaoProposalKindChangeConfig {
  ChangeConfig: { config: SputnikDaoConfig };
}

export interface SputnikDaoProposalKindChangePolicy {
  ChangePolicy: { policy: SputnikDaoPolicy };
}

export interface SputnikDaoProposalKindAddMemberToRole {
  AddMemberToRole: { member_id: string; role: string };
}

export interface SputnikDaoProposalKindRemoveMemberFromRole {
  RemoveMemberFromRole: { member_id: string; role: string };
}

export interface SputnikDaoProposalKindFunctionCall {
  FunctionCall: {
    receiver_id: string;
    actions: {
      method_name: string;
      args: string;
      deposit: string;
      gas: number;
    }[];
  };
}

export interface SputnikDaoProposalKindUpgradeSelf {
  UpgradeSelf: {
    hash: string;
  };
}

export interface SputnikDaoProposalKindUpgradeRemote {
  UpgradeRemote: {
    receiver_id: string;
    method_name: string;
    hash: string;
  };
}

export interface SputnikDaoProposalKindTransfer {
  Transfer: {
    token_id: string;
    receiver_id: string;
    amount: string;
    msg?: string;
  };
}

export interface SputnikDaoProposalKindSetStakingContract {
  SetStakingContract: {
    staking_id: string;
  };
}

export interface SputnikDaoProposalKindAddBounty {
  AddBounty: {
    bounty: SputnikDaoBounty;
  };
}

export interface SputnikDaoProposalKindBountyDone {
  BountyDone: {
    bounty_id: number;
    receiver_id: string;
  };
}

export type SputnikDaoProposalKindVote = 'Vote';

export type SputnikDaoProposalKind =
  | SputnikDaoProposalKindChangeConfig
  | SputnikDaoProposalKindChangePolicy
  | SputnikDaoProposalKindAddMemberToRole
  | SputnikDaoProposalKindRemoveMemberFromRole
  | SputnikDaoProposalKindFunctionCall
  | SputnikDaoProposalKindUpgradeSelf
  | SputnikDaoProposalKindUpgradeRemote
  | SputnikDaoProposalKindTransfer
  | SputnikDaoProposalKindSetStakingContract
  | SputnikDaoProposalKindAddBounty
  | SputnikDaoProposalKindBountyDone
  | SputnikDaoProposalKindVote;

export enum SputnikDaoProposalStatus {
  InProgress = 'InProgress',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Removed = 'Removed',
  Expired = 'Expired',
  Moved = 'Moved',
  Failed = 'Failed',
}

export enum SputnikDaoProposalVote {
  Approve = 'Approve',
  Reject = 'Reject',
}

export interface SputnikDaoProposal {
  proposer: string;
  description: string;
  kind: SputnikDaoProposalKind;
  status: SputnikDaoProposalStatus;
  vote_counts: Record<string, number[]>;
  votes: Record<string, SputnikDaoProposalVote>;
  submission_time: string;
}

export interface SputnikDaoProposalOutput extends SputnikDaoProposal {
  id: number;
}

export interface SputnikDaoProposalInput {
  description: string;
  kind: SputnikDaoProposalKind;
}

export interface SputnikDaoBounty {
  description: string;
  token: string;
  amount: string;
  times: number;
  max_deadline: string;
}

export interface SputnikDaoBountyOutput extends SputnikDaoBounty {
  id: number;
}

export interface SputnikDaoBountyClaim {
  bounty_id: number;
  start_time: string;
  deadline: string;
  completed: boolean;
}

export type SputnikDaoProposalAction =
  | 'AddProposal'
  | 'RemoveProposal'
  | 'VoteApprove'
  | 'VoteReject'
  | 'VoteRemove'
  | 'Finalize'
  | 'MoveToHub';

interface ISputnikDaoContract extends Contract {
  get_config(blockQuery: BlockQuery): Promise<SputnikDaoConfig>;

  get_policy(blockQuery: BlockQuery): Promise<SputnikDaoPolicy>;

  get_staking_contract(blockQuery: BlockQuery): Promise<string>;

  get_available_amount(blockQuery: BlockQuery): Promise<string>;

  delegation_total_supply(blockQuery: BlockQuery): Promise<string>;

  get_last_proposal_id(blockQuery: BlockQuery): Promise<number>;

  get_proposals(
    params: {
      from_index: number;
      limit: number;
    },
    blockQuery: BlockQuery,
  ): Promise<SputnikDaoProposalOutput[]>;

  get_proposal(
    params: { id: number },
    blockQuery: BlockQuery,
  ): Promise<SputnikDaoProposalOutput>;

  get_last_bounty_id(blockQuery: BlockQuery): Promise<number>;

  get_bounties(
    params: {
      from_index: number;
      limit: number;
    },
    blockQuery: BlockQuery,
  ): Promise<SputnikDaoBountyOutput[]>;

  get_bounty(
    params: { id: number },
    blockQuery: BlockQuery,
  ): Promise<SputnikDaoBountyOutput>;

  get_bounty_claims(
    params: {
      account_id: string;
    },
    blockQuery: BlockQuery,
  ): Promise<SputnikDaoBountyClaim[]>;

  get_bounty_number_of_claims(
    params: any,
    blockQuery: BlockQuery,
  ): Promise<number>;

  delegation_balance_of(
    params: { account_id: string },
    blockQuery: BlockQuery,
  ): Promise<string>;
}

export class SputnikDaoContract extends BaseContract<ISputnikDaoContract> {
  constructor(account: Account, accountId: string) {
    super(account, accountId, {
      changeMethods: [],
      viewMethods: [
        'get_config',
        'get_policy',
        'get_staking_contract',
        'get_available_amount',
        'delegation_total_supply',
        'get_last_proposal_id',
        'get_proposals',
        'get_proposal',
        'get_last_bounty_id',
        'get_bounties',
        'get_bounty',
        'get_bounty_claims',
        'get_bounty_number_of_claims',
        'delegation_balance_of',
      ],
    });
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_config(blockId?: BlockId): Promise<SputnikDaoConfig> {
    return this.contract.get_config(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_policy(blockId?: BlockId): Promise<SputnikDaoPolicy> {
    return this.contract.get_policy(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_staking_contract(blockId?: BlockId): Promise<string> {
    return this.contract.get_staking_contract(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_available_amount(blockId?: BlockId): Promise<string> {
    return this.contract.get_available_amount(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  delegation_total_supply(blockId?: BlockId): Promise<string> {
    return this.contract.delegation_total_supply(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_last_proposal_id(blockId?: BlockId): Promise<number> {
    return this.contract.get_last_proposal_id(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_proposals(
    params: {
      from_index: number;
      limit: number;
    },
    blockId?: BlockId,
  ): Promise<SputnikDaoProposalOutput[]> {
    return this.contract.get_proposals(params, this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_proposal(
    params: { id: number },
    blockId?: BlockId,
  ): Promise<SputnikDaoProposalOutput> {
    return this.contract.get_proposal(params, this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_last_bounty_id(blockId?: BlockId): Promise<number> {
    return this.contract.get_last_bounty_id(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_bounties(
    params: {
      from_index: number;
      limit: number;
    },
    blockId?: BlockId,
  ): Promise<SputnikDaoBountyOutput[]> {
    return this.contract.get_bounties(params, this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_bounty(
    params: { id: number },
    blockId?: BlockId,
  ): Promise<SputnikDaoBountyOutput> {
    return this.contract.get_bounty(params, this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_bounty_claims(
    params: {
      account_id: string;
    },
    blockId?: BlockId,
  ): Promise<SputnikDaoBountyClaim[]> {
    return this.contract.get_bounty_claims(params, this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_bounty_number_of_claims(params: any, blockId?: BlockId): Promise<number> {
    return this.contract.get_bounty_number_of_claims(
      params,
      this.getBlockQuery(blockId),
    );
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  delegation_balance_of(
    params: { account_id: string },
    blockId?: BlockId,
  ): Promise<string> {
    return this.contract.delegation_balance_of(
      params,
      this.getBlockQuery(blockId),
    );
  }
}
