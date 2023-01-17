import { Retryable } from 'typescript-retry-decorator';
import { Contract } from 'near-api-js/lib/contract';
import { Account } from 'near-api-js/lib/account';
import { BlockId } from 'near-api-js/lib/providers/provider';
import { BaseContract, BlockQuery } from './base.contract';

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

interface INFTokenContract extends Contract {
  nft_tokens_for_owner(
    params: {
      account_id: string;
      from_index: string;
      limit: number;
    },
    blockQuery: BlockQuery,
  ): Promise<NFTokenOutput[]>;
  nft_metadata(blockQuery: BlockQuery): Promise<NFTokenContractMetadata>;
  nft_total_supply(blockQuery: BlockQuery): Promise<string>;
}

export class NFTokenContract extends BaseContract<INFTokenContract> {
  constructor(account: Account, accountId: string) {
    super(account, accountId, {
      changeMethods: [],
      viewMethods: ['nft_tokens_for_owner', 'nft_metadata', 'nft_total_supply'],
    });
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  nft_tokens_for_owner(
    params: {
      account_id: string;
      from_index: string;
      limit: number;
    },
    blockId?: BlockId,
  ): Promise<NFTokenOutput[]> {
    return this.contract.nft_tokens_for_owner(
      params,
      this.getBlockQuery(blockId),
    );
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  nft_metadata(blockId?: BlockId): Promise<NFTokenContractMetadata> {
    return this.contract.nft_metadata(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  nft_total_supply(blockId?: BlockId): Promise<string> {
    return this.contract.nft_total_supply(this.getBlockQuery(blockId));
  }
}
