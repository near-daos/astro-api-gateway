import { ProposalPolicyLabel } from './proposal-policy-label';

export enum ProposalType {
  ChangeConfig = 'ChangeConfig',
  ChangePolicy = 'ChangePolicy',
  AddMemberToRole = 'AddMemberToRole',
  RemoveMemberFromRole = 'RemoveMemberFromRole',
  FunctionCall = 'FunctionCall',
  UpgradeSelf = 'UpgradeSelf',
  UpgradeRemote = 'UpgradeRemote',
  Transfer = 'Transfer',
  SetStakingContract = 'SetStakingContract',
  AddBounty = 'AddBounty',
  BountyDone = 'BountyDone',
  Vote = 'Vote',
}

export const ProposalTypeToPolicyLabel = {
  [ProposalType.ChangeConfig]: ProposalPolicyLabel.Config,
  [ProposalType.ChangePolicy]: ProposalPolicyLabel.Policy,
  [ProposalType.AddMemberToRole]: ProposalPolicyLabel.AddMemberToRole,
  [ProposalType.RemoveMemberFromRole]: ProposalPolicyLabel.RemoveMemberFromRole,
  [ProposalType.FunctionCall]: ProposalPolicyLabel.Call,
  [ProposalType.UpgradeSelf]: ProposalPolicyLabel.UpgradeSelf,
  [ProposalType.UpgradeRemote]: ProposalPolicyLabel.UpgradeRemote,
  [ProposalType.Transfer]: ProposalPolicyLabel.Transfer,
  [ProposalType.SetStakingContract]: ProposalPolicyLabel.SetVoteToken,
  [ProposalType.AddBounty]: ProposalPolicyLabel.AddBounty,
  [ProposalType.BountyDone]: ProposalPolicyLabel.BountyDone,
  [ProposalType.Vote]: ProposalPolicyLabel.Vote,
};
