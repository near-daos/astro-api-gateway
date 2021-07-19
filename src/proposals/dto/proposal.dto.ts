import { ProposalStatus } from "./proposal-status.dto";
import { ProposalType } from "./proposal-type.dto";

export type CreateProposalKindDto =
  | {
      type: ProposalType.Payout;
      amount: string;
    }
  | {
      type: ProposalType.ChangeVotePeriod;
      vote_period: string;
    }
  | {
      type: ProposalType.NewCouncil;
    }
  | {
      type: ProposalType.RemoveCouncil;
    }
  | {
      type: ProposalType.ChangePurpose;
      purpose: string;
    };

export class CreateProposalDto {
  id: number;
  daoId: string;
  target: string;
  proposer: string;
  description: string;
  status: ProposalStatus;
  kind: CreateProposalKindDto;
  vote_period_end: number;
  vote_yes: number;
  vote_no: number;
  votes: {
    [key: string]: 'Yes' | 'No';
  }
}
