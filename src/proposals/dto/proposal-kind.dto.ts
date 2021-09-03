import { PolicyDto } from 'src/daos/dto/policy.dto';
import { DaoConfig } from 'src/daos/types/dao-config';
import { ActionCall } from 'src/sputnikdao/types/action-call';
import { Bounty } from 'src/sputnikdao/types/bounty';
import { ProposalType } from '../types/proposal-type';

export type ProposalKind =
  | ProposalKindChangeConfig
  | ProposalKindChangePolicy
  | ProposalKindAddMemberToRole
  | ProposalKindAddRemoveMemberFromRole
  | ProposalKindFunctionCall
  | ProposalKindUpgradeSelf
  | ProposalKindUpgradeRemote
  | ProposalKindTransfer
  | ProposalKindSetStakingContract
  | ProposalKindAddBounty
  | ProposalKindBountyDone
  | ProposalKindVote;

/// Change the DAO config.
export type ProposalKindChangeConfig = {
  type: ProposalType.ChangeConfig;
  config: DaoConfig;
};

/// Change the full policy.
export type ProposalKindChangePolicy = {
  type: ProposalType.ChangePolicy;
  policy: PolicyDto | string[];
};

/// Add member to given role in the policy. This is short cut to updating the whole policy.
export type ProposalKindAddMemberToRole = {
  type: ProposalType.AddMemberToRole;
  memberId: string;
  role: string;
};

/// Remove member to given role in the policy. This is short cut to updating the whole policy.
export type ProposalKindAddRemoveMemberFromRole = {
  type: ProposalType.RemoveMemberFromRole;
  memberId: string;
  role: string;
};

/// Calls `receiver_id` with list of method names in a single promise.
/// Allows this contract to execute any arbitrary set of actions in other contracts.
export type ProposalKindFunctionCall = {
  type: ProposalType.FunctionCall;
  receiverId: string;
  actions: ActionCall[];
};

/// Upgrade this contract with given hash from blob store.
export type ProposalKindUpgradeSelf = {
  type: ProposalType.UpgradeSelf;
  hash: string;
};

/// Upgrade another contract, by calling method with the code from given hash from blob store.
export type ProposalKindUpgradeRemote = {
  type: ProposalType.UpgradeRemote;
  receiverId: string;
  methodName: string;
  hash: string;
};

/// Transfers given amount of `token_id` from this DAO to `receiver_id`.
/// If `msg` is not None, calls `ft_transfer_call` with given `msg`. Fails if this base token.
/// For `ft_transfer` and `ft_transfer_call` `memo` is the `description` of the proposal.
export type ProposalKindTransfer = {
  type: ProposalType.Transfer;
  /// Can be "" for $NEAR or a valid account id.
  tokenId: string;
  receiverId: string;
  amount: string;
  msg: string;
};

/// Sets staking contract. Can only be proposed if staking contract is not set yet.
export type ProposalKindSetStakingContract = {
  type: ProposalType.SetStakingContract;
  stakingId: string;
};

/// Add new bounty.
export type ProposalKindAddBounty = {
  type: ProposalType.AddBounty;
  bounty: Bounty;
};

/// Indicates that given bounty is done by given user.
export type ProposalKindBountyDone = {
  type: ProposalType.BountyDone;
  bountyId: string;
  receiverId: string;
};

/// Just a signaling vote, with no execution.
export type ProposalKindVote = {
  type: ProposalType.Vote;
};
