export class CreateDaoDto {
  id: string;
  amount: string;
  bond: string;
  purpose: string;
  votePeriod: string;
  members: string[];
  numberOfProposals: number;
  numberOfMembers: number;
  txHash: string;
}
