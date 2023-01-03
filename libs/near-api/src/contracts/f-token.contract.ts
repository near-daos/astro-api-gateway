import { Retryable } from 'typescript-retry-decorator';
import { Contract } from 'near-api-js/lib/contract';
import { BlockId } from 'near-api-js/lib/providers/provider';
import { Account } from 'near-api-js/lib/account';
import { BaseContract, BlockQuery } from './base.contract';

export interface FTokenMetadata {
  spec: string;
  name: string;
  symbol: string;
  icon: string | null;
  reference: string | null;
  reference_hash: string | null;
  decimals: number;
}

interface IFTokenContract extends Contract {
  ft_balance_of(
    params: { account_id: string },
    blockQuery: BlockQuery,
  ): Promise<string>;
  ft_metadata(blockQuery: BlockQuery): Promise<FTokenMetadata>;
  ft_total_supply(blockQuery: BlockQuery): Promise<string>;
}

export class FTokenContract extends BaseContract<IFTokenContract> {
  constructor(account: Account, accountId: string) {
    super(account, accountId, {
      changeMethods: [],
      viewMethods: ['ft_balance_of', 'ft_metadata', 'ft_total_supply'],
    });
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  ft_balance_of(
    params: { account_id: string },
    blockId?: BlockId,
  ): Promise<string> {
    return this.contract.ft_balance_of(params, this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  ft_metadata(blockId?: BlockId): Promise<FTokenMetadata> {
    return this.contract.ft_metadata(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  ft_total_supply(blockId?: BlockId): Promise<string> {
    return this.contract.ft_total_supply(this.getBlockQuery(blockId));
  }
}
