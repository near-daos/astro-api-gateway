import { Contract } from 'near-api-js/lib/contract';

export interface StakingContractUserOutput {
  storage_used: number;
  near_amount: string;
  vote_amount: string;
  next_action_timestamp: string;
  delegated_amounts: [string, string][];
}

// TODO add return types
export declare class StakingContract extends Contract {
  ft_total_supply(): Promise<string>;
  ft_balance_of(): Promise<string>;
  get_user(params: { account_id: string }): Promise<StakingContractUserOutput>;
  delegate(): Promise<any>;
  undelegate(): Promise<any>;
  withdraw(): Promise<any>;
}
