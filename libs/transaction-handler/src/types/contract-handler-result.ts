export enum ContractHandlerResultType {
  DaoCreate = 'DaoCreate',
  ProposalCreate = 'ProposalCreate',
  ProposalVote = 'ProposalVote',
  BountyClaim = 'BountyClaim',
  Delegate = 'Delegate',
  TokenUpdate = 'TokenUpdate',
  NftUpdate = 'NftUpdate',
  Unknown = 'Unknown',
}

export type ContractHandlerResult = {
  type: ContractHandlerResultType;
  metadata?: Record<string, any>;
};
