import { Contract } from 'near-api-js/lib/contract';

export interface NFTokenContractMetadata {
  spec: string;
  name: string;
  symbol: string;
  icon: string | null;
  base_uri: string | null;
  reference: string | null;
  reference_hash: string | null;
}

export interface NFTokenMetadata {
  title: string | null;
  description: string | null;
  media: string | null;
  media_hash: string | null;
  copies: number | null;
  issued_at: string | number | null;
  expires_at: string | number | null;
  starts_at: string | number | null;
  updated_at: string | number | null;
  extra: string | null;
  reference: string | null;
  reference_hash: string | null;
}

export interface NFTokenOutput {
  id?: string;
  token_id?: string;
  owner_id: string | { Account: string };
  metadata: NFTokenMetadata;
  approved_account_ids: string[];
  minter?: string;
  royalty?: {
    split_between: Record<string, { numerator: number }>;
    percentage: { numerator: number };
  } | null;
  split_owners?: null;
  loan?: null;
  composeable_stats?: { local_depth: number; cross_contract_children: number };
  origin_key?: null;
}

export declare class NFTokenContract extends Contract {
  nft_tokens_for_owner(params: {
    account_id: string;
    from_index: string;
    limit: number;
  }): Promise<NFTokenOutput[]>;
  nft_metadata(): Promise<NFTokenContractMetadata>;
  nft_total_supply(): Promise<string>;
}
