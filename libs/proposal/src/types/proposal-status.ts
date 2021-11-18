export enum ProposalStatus {
  InProgress = 'InProgress',
  /// If quorum voted yes, this proposal is successfully approved.
  Approved = 'Approved',
  /// If quorum voted no, this proposal is rejected. Bond is returned.
  Rejected = 'Rejected',
  /// If quorum voted to remove (e.g. spam), this proposal is rejected and bond is not returned.
  /// Interfaces shouldn't show removed proposals.
  Removed = 'Removed',
  /// Expired after period of time.
  Expired = 'Expired',
  /// If proposal was moved to Hub or somewhere else.
  Moved = 'Moved',
}
