import { Retryable } from 'typescript-retry-decorator';
import { Contract } from 'near-api-js/lib/contract';
import { Account } from 'near-api-js/lib/account';
import { BlockId } from 'near-api-js/lib/providers/provider';
import { BaseContract, BlockQuery } from './base.contract';

export interface StakingContractUserOutput {
  storage_used: number;
  near_amount: string;
  vote_amount: string;
  next_action_timestamp: string;
  delegated_amounts: [string, string][];
}

interface IStakingContract extends Contract {
  ft_total_supply(blockQuery: BlockQuery): Promise<string>;
  ft_balance_of(blockQuery: BlockQuery): Promise<string>;
  get_user(
    params: { account_id: string },
    blockQuery: BlockQuery,
  ): Promise<StakingContractUserOutput>;
}

export class StakingContract extends BaseContract<IStakingContract> {
  constructor(account: Account, accountId: string) {
    super(account, accountId, {
      viewMethods: ['ft_total_supply', 'ft_balance_of', 'get_user'],
      changeMethods: [],
    });
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  ft_total_supply(blockId?: BlockId): Promise<string> {
    return this.contract.ft_total_supply(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  ft_balance_of(blockId?: BlockId): Promise<string> {
    return this.contract.ft_balance_of(this.getBlockQuery(blockId));
  }

  @Retryable({
    maxAttempts: 3,
    backOff: 3000,
  })
  get_user(
    params: { account_id: string },
    blockId?: BlockId,
  ): Promise<StakingContractUserOutput> {
    return this.contract.get_user(params, this.getBlockQuery(blockId));
  }
}
