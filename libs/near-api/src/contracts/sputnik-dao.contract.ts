import { Contract } from 'near-api-js/lib/contract';

export interface SputnikDaoConfig {
  name: string;
  purpose: string;
  metadata: string;
}

export type SputnikDaoVotePolicyWeightKind = 'TokenWeight' | 'RoleWeight';

export type SputnikDaoVotePolicyKind = 'Weight' | 'Ratio';

export interface SputnikDaoVotePolicy {
  weightKind: SputnikDaoVotePolicyWeightKind;
  quorum: number;
  kind: SputnikDaoVotePolicyKind;
  weight?: number;
  ratio?: number[];
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

export interface SputnikDaoRole {
  name: string;
  kind: SputnikDaoRoleKind;
  permissions: string[];
  vote_policy: Record<string, SputnikDaoVotePolicy>;
}

export interface SputnikDaoPolicy {
  roles: SputnikDaoRole[];
  proposal_bond: string;
  proposal_period: string;
  bounty_bond: string;
  bounty_forgiveness_period: string;
}

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

export type SputnikDaoProposalStatus =
  | 'InProgress'
  | 'Approved'
  | 'Rejected'
  | 'Removed'
  | 'Expired'
  | 'Moved'
  | 'Failed';

export interface SputnikDaoProposal {
  proposer: string;
  description: string;
  kind: SputnikDaoProposalKind;
  status: SputnikDaoProposalStatus;
  vote_counts: string;
  votes: Record<string, 'Approve' | 'Reject'>;
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

export declare class SputnikDaoContract extends Contract {
  get_config(): Promise<SputnikDaoConfig>;

  get_policy(): Promise<SputnikDaoPolicy>;

  get_staking_contract(): Promise<string>;

  get_available_amount(): Promise<string>;

  delegation_total_supply(): Promise<string>;

  get_last_proposal_id(): Promise<number>;

  get_proposals(params: {
    from_index: number;
    limit: number;
  }): Promise<SputnikDaoProposalOutput[]>;

  get_proposal(params: { id: number }): Promise<SputnikDaoProposalOutput>;

  get_last_bounty_id(): Promise<number>;

  get_bounties(params: {
    from_index: number;
    limit: number;
  }): Promise<SputnikDaoBountyOutput[]>;

  get_bounty(params: { id: number }): Promise<SputnikDaoBounty>;

  get_bounty_claims(params: {
    account_id: string;
  }): Promise<SputnikDaoBountyClaim[]>;

  get_bounty_number_of_claims(params: any): Promise<number>;

  delegation_balance_of(params: { account_id: string }): Promise<string>;

  add_proposal(params: { proposal: SputnikDaoProposalInput }): Promise<number>;

  act_proposal(params: {
    id: number;
    action: SputnikDaoProposalAction;
    memo?: string;
  }): Promise<boolean | undefined>;
}
