export interface DaoInfo {
  config: {
    metadata: string;
    name: string;
    purpose: string;
  };
  policy: unknown;
  totalSupply: string;
  lastBountyId: number;
  lastProposalId: number;
  stakingContract: string;
  amount: string;
}
