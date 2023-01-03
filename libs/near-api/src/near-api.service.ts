import { Account, Near } from 'near-api-js';
import { Inject, Injectable } from '@nestjs/common';
import { NEAR_API_PROVIDER } from '@sputnik-v2/common';
import { NearApiProvider } from '@sputnik-v2/config/near-api';
import { BlockId } from 'near-api-js/lib/providers/provider';
import { Retryable } from 'typescript-retry-decorator';

import {
  FTokenContract,
  NFTokenContract,
  SputnikDaoContract,
  SputnikDaoFactoryContract,
  StakingContract,
} from './contracts';
import {
  NearAccountState,
  NearTransactionStatus,
  NearProvider,
  castTransactionAction,
  castTransactionReceipt,
  castTransactionReceiptOutcome,
  castTransactionStatus,
  ViewCodeResponse,
} from './types';

@Injectable()
export class NearApiService {
  private near!: Near;
  private sputnikDaoFactoryContractName: string;
  private account: Account;
  private provider: NearProvider;

  constructor(
    @Inject(NEAR_API_PROVIDER)
    private nearApiProvider: NearApiProvider,
  ) {
    const { near, account, provider, sputnikDaoFactoryContractName } =
      nearApiProvider;

    this.near = near;
    this.account = account;
    this.provider = provider as NearProvider;
    this.sputnikDaoFactoryContractName = sputnikDaoFactoryContractName;
  }

  public async getBlock(blockId: BlockId) {
    return this.provider.block({ blockId });
  }

  @Retryable({
    maxAttempts: 5,
    backOff: 1000,
  })
  public async getBlockRetry(blockHash: string) {
    return this.getBlock(blockHash);
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

  @Retryable({
    maxAttempts: 5,
    backOff: 1000,
  })
  public async getTxStatusRetry(
    transactionHash: string,
    accountId: string,
  ): Promise<NearTransactionStatus> {
    return this.getTxStatus(transactionHash, accountId);
  }

  public async getAccountState(accountId: string): Promise<NearAccountState> {
    const account = await this.near.account(accountId);
    return account.state();
  }

  public async getAccountAmount(accountId: string): Promise<string> {
    return (await this.getAccountState(accountId)).amount;
  }

  public getFTokenContract(contractId: string): FTokenContract {
    return new FTokenContract(this.account, contractId);
  }

  public getNFTokenContract(contractId: string): NFTokenContract {
    return new NFTokenContract(this.account, contractId);
  }

  public getSputnikDaoContract(contractId: string): SputnikDaoContract {
    return new SputnikDaoContract(this.account, contractId);
  }

  public getSputnikDaoFactoryContract(): SputnikDaoFactoryContract {
    return new SputnikDaoFactoryContract(
      this.account,
      this.sputnikDaoFactoryContractName,
    );
  }

  public async getStakingContract(
    contractId: string,
  ): Promise<StakingContract> {
    const account = await this.near.account(contractId);
    return new StakingContract(account, contractId);
  }

  public async getContractVersionHash(id: string): Promise<string> {
    const response = await this.provider.query<ViewCodeResponse>({
      request_type: 'view_code',
      finality: 'final',
      account_id: id,
    });
    return response.hash;
  }
}
