import { Account, Contract } from 'near-api-js';
import { ContractMethods } from 'near-api-js/lib/contract';

import { KYCContractInterface } from './kyc-contract.interface';
import { AccountId } from '../../common/types/common';
import { NTNFTTokenDto } from '../types/nt-nft-token';

const Base: {
  new (
    account: Account,
    contractId: string,
    options: ContractMethods,
  ): KYCContractInterface;
} = Contract as any;

export class KYCContract extends Base {
  constructor(account: Account, contractId: string) {
    super(account, contractId, {
      viewMethods: [
        'get_mint_authorizer',
        'ntnft_total_supply',
        'ntnft_token',
        'ntnft_metadata',
        'ntnft_tokens',
        'ntnft_supply_for_owner',
        'ntnft_tokens_for_owner',
      ],
      changeMethods: [],
    });
  }

  async getTotalSupply(): Promise<BigInt> {
    const supply = await this.ntnft_total_supply();

    return BigInt(supply);
  }

  async getSupplyForOwner(accountId: AccountId): Promise<BigInt> {
    const supply = await this.ntnft_supply_for_owner({ account_id: accountId });

    return BigInt(supply);
  }

  async getTokens(fromIndex: string, limit: number): Promise<NTNFTTokenDto[]> {
    return this.ntnft_tokens({ from_index: fromIndex, limit });
  }
}
