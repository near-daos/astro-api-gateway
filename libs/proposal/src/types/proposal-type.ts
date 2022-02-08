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
  [ProposalType.ChangeConfig]: 'config',
  [ProposalType.ChangePolicy]: 'policy',
  [ProposalType.AddMemberToRole]: 'add_member_to_role',
  [ProposalType.RemoveMemberFromRole]: 'remove_member_from_role',
  [ProposalType.FunctionCall]: 'call',
  [ProposalType.UpgradeSelf]: 'upgrade_self',
  [ProposalType.UpgradeRemote]: 'upgrade_remote',
  [ProposalType.Transfer]: 'transfer',
  [ProposalType.SetStakingContract]: 'set_vote_token',
  [ProposalType.AddBounty]: 'add_bounty',
  [ProposalType.BountyDone]: 'bounty_done',
  [ProposalType.Vote]: 'vote',
};
