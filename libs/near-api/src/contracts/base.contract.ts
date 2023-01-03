import { Contract, ContractMethods } from 'near-api-js/lib/contract';
import { BlockId, BlockReference } from 'near-api-js/lib/providers/provider';
import { Account } from 'near-api-js/lib/account';

export interface BlockQuery {
  blockQuery: BlockReference;
}

export class BaseContract<T extends Contract> {
  public contract: T;

  constructor(
    account: Account,
    accountId: string,
    contractMethods: ContractMethods,
  ) {
    this.contract = new Contract(account, accountId, contractMethods) as T;
  }

  getBlockQuery(blockId?: BlockId): BlockQuery {
    return {
      blockQuery: blockId ? { blockId } : { finality: 'optimistic' },
    };
  }
}
