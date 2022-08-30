import { Contract } from 'near-api-js';

import { TokenId, AccountId } from '../../common/types/common';
import { NTNFTMetadata } from '../types/nt-nft-metadata';
import { NTNFTTokenDto } from '../types/nt-nft-token';

export interface KYCContractInterface extends Contract {
  get_mint_authorizer(): Promise<string>;
  ntnft_total_supply(): Promise<string>;
  ntnft_token(args: { token_id: TokenId }): Promise<NTNFTTokenDto>;
  ntnft_metadata(args: { token_id: TokenId }): Promise<NTNFTMetadata>;
  ntnft_tokens(args: {
    from_index: string;
    limit: number;
  }): Promise<NTNFTTokenDto[]>;
  ntnft_supply_for_owner(args: { account_id: AccountId }): Promise<string>;
  ntnft_tokens_for_owner(args: {
    account_id: AccountId;
    from_index: string;
    limit: number;
  }): Promise<NTNFTTokenDto[]>;
}
