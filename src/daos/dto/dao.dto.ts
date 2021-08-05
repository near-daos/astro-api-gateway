export class CreateDaoDto {
  id: string;
  amount: string;
  bond: string;
  purpose: string;
  votePeriod: string;
  council: string[];
  numberOfProposals: number;
  councilSeats: number;
  numberOfMembers: number;
  txHash: string;
}
