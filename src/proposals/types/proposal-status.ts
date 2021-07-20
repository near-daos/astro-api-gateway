export enum ProposalStatus {
  // Vote for proposal has failed due (not enuough votes).
  Fail = 'Fail',
  // Given voting policy, the uncontested minimum of votes was acquired.
  // Delaying the finalization of the proposal to check that there is no contenders (who would vote against).
  Delay = 'Delay',
  // Proposal has successfully passed.
  Success = 'Success',
  // Proposal was rejected by the vote.
  Reject = 'Reject',
  // Proposal is in active voting stage.
  Vote = 'Vote',
}
