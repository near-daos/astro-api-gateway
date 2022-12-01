import { Contract } from 'near-api-js/lib/contract';

export interface FTokenMetadata {
  spec: string;
  name: string;
  symbol: string;
  icon: string | null;
  reference: string | null;
  reference_hash: string | null;
  decimals: number;
}

export declare class FTokenContract extends Contract {
  ft_balance_of(params: { account_id: string }): Promise<string>;
  ft_metadata(): Promise<FTokenMetadata>;
  ft_total_supply(): Promise<string>;
}
