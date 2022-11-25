import { Account, Contract, Near } from 'near-api-js';
import { Inject, Injectable } from '@nestjs/common';
import { NEAR_API_PROVIDER } from '@sputnik-v2/common';
import { NearApiContract, NearApiProvider } from '@sputnik-v2/config/near-api';
import { BlockId } from 'near-api-js/lib/providers/provider';

import {
  NearAccountState,
  NearTransactionStatus,
  NearProvider,
  castTransactionAction,
  castTransactionReceipt,
  castTransactionReceiptOutcome,
  castTransactionStatus,
  ViewCodeResponse,
  NearStakingContract,
} from './types';

@Injectable()
export class NearApiService {
  private near!: Near;
  private contracts: Record<string, NearApiContract>;
  private account: Account;
  private provider: NearProvider;

  constructor(
    @Inject(NEAR_API_PROVIDER)
    private nearApiProvider: NearApiProvider,
  ) {
    const { near, account, provider, contracts } = nearApiProvider;

    this.near = near;
    this.account = account;
    this.provider = provider as NearProvider;
    this.contracts = contracts;
  }

  public async getBlock(blockId: BlockId) {
    return this.provider.block({ blockId });
  }

  public async getTxStatus(
    transactionHash: string,
    accountId: string,
  ): Promise<NearTransactionStatus> {
    const txStatus = await this.provider.txStatusReceipts(
      transactionHash,
      accountId,
    );

    return {
      status: castTransactionStatus(txStatus.status),
      transaction: {
        ...txStatus.transaction,
        actions: txStatus.transaction.actions.map(castTransactionAction),
      },
      transaction_outcome: txStatus.transaction_outcome,
      receipts: txStatus.receipts.map(castTransactionReceipt),
      receipts_outcome: txStatus.receipts_outcome.map(
        castTransactionReceiptOutcome,
      ),
    };
  }

  public async getAccountState(accountId: string): Promise<NearAccountState> {
    const account = await this.near.account(accountId);
    return account.state();
  }

  public async getAccountAmount(accountId: string): Promise<string> {
    return (await this.getAccountState(accountId)).amount;
  }

  public getContract<T extends Contract>(key: string, id?: string): T {
    const contract = this.contracts[key];
    const contractId = id || contract?.contractId;

    return new Contract(this.account, contractId, {
      viewMethods: contract.viewMethods,
      changeMethods: contract.changeMethods,
    }) as T;
  }

  public async getStakingContract(
    contractId: string,
  ): Promise<NearStakingContract> {
    const account = await this.near.account(contractId);

    return new Contract(account, contractId, {
      viewMethods: ['ft_total_supply', 'ft_balance_of', 'get_user'],
      changeMethods: ['delegate', 'undelegate', 'withdraw'],
    }) as NearStakingContract;
  }

  public async getContractVersionHash(id: string): Promise<string> {
    const response = await this.provider.query<ViewCodeResponse>({
      request_type: 'view_code',
      finality: 'final',
      account_id: id,
    });
    return response.hash;
  }

  public async getLastBlock(): Promise<any> {
    return this.provider.block({
      finality: 'final',
    });
  }
}
