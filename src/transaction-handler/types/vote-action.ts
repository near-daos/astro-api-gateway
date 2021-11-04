export enum VoteAction {
  /// Action to add proposal. Used internally.
  AddProposal = 'AddProposal',
  /// Action to remove given proposal. Used for immediate deletion in special cases.
  RemoveProposal = 'RemoveProposal',
  /// Vote to approve given proposal or bounty.
  VoteApprove = 'VoteApprove',
  /// Vote to reject given proposal or bounty.
  VoteReject = 'VoteReject',
  /// Vote to remove given proposal or bounty (because it's spam).
  VoteRemove = 'VoteRemove',
  /// Finalize proposal, called when it's expired to return the funds
  /// (or in the future can be used for early proposal closure).
  Finalize = 'Finalize',
  /// Move a proposal to the hub to shift into another DAO.
  MoveToHub = 'MoveToHub',
}
