import { Retryable } from 'typescript-retry-decorator';
import { Contract } from 'near-api-js/lib/contract';
import { Account } from 'near-api-js/lib/account';
import { BlockId } from 'near-api-js/lib/providers/provider';
import { BaseContract, BlockQuery } from './base.contract';

export interface SputnikDaoVersion {
  version: number[];
  commit_id: string;
  changelog_url: string | null;
}

interface ISputnikDaoFactoryContract extends Contract {
  get_dao_list(blockQuery: BlockQuery): Promise<string[]>;
  get_number_daos(blockQuery: BlockQuery): Promise<number>;
  get_daos(
    params: { from_index: number; limit: number },
    blockQuery: BlockQuery,
  ): Promise<string[]>;
  get_contracts_metadata(
    blockQuery: BlockQuery,
  ): Promise<[string, SputnikDaoVersion][]>;
}

export class SputnikDaoFactoryContract extends BaseContract<ISputnikDaoFactoryContract> {
  constructor(account: Account, accountId: string) {
    super(account, accountId, {
      viewMethods: [
        'get_dao_list',
        'get_number_daos',
        'get_daos',
        'get_contracts_metadata',
      ],
      changeMethods: [],
    });
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_dao_list(blockId?: BlockId): Promise<string[]> {
    return this.contract.get_dao_list(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_number_daos(blockId?: BlockId): Promise<number> {
    return this.contract.get_number_daos(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_daos(
    params: { from_index: number; limit: number },
    blockId?: BlockId,
  ): Promise<string[]> {
    return this.contract.get_daos(params, this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_contracts_metadata(
    blockId?: BlockId,
  ): Promise<[string, SputnikDaoVersion][]> {
    return this.contract.get_contracts_metadata(this.getBlockQuery(blockId));
  }
}
