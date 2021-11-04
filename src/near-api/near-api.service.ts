import { Account, Contract, Near } from 'near-api-js';
import { Provider } from 'near-api-js/lib/providers';
import { Inject, Injectable } from '@nestjs/common';

import { NEAR_API_PROVIDER } from 'src/common/constants';
import { NearApiContract, NearApiProvider } from 'src/config/near-api';

import { NearAccountState } from './types/near-account-state';
import { NearTransactionStatus } from './types/near-transaction-status';
import { castTransactionAction } from './types/near-transaction-action';

@Injectable()
export class NearApiService {
  private near!: Near;

  private contracts: Record<string, NearApiContract>;

  private account: Account;

  private provider: Provider;

  constructor(
    @Inject(NEAR_API_PROVIDER)
    private nearApiProvider: NearApiProvider,
  ) {
    const { near, account, provider, contracts } = nearApiProvider;

    this.near = near;
    this.account = account;
    this.provider = provider;
    this.contracts = contracts;
  }

  public async getTxStatus(
    transactionHash: string,
    accountId: string,
  ): Promise<NearTransactionStatus> {
    const txStatus = await this.provider.txStatus(transactionHash, accountId);

    txStatus.transaction.actions = txStatus.transaction.actions.map(
      castTransactionAction,
    );

    return txStatus;
  }

  public async getAccountState(accountId: string): Promise<NearAccountState> {
    const account = await this.near.account(accountId);
    return account.state();
  }

  public getContract(key: string, id?: string): Contract & any {
    const contract = this.contracts[key];
    const contractId = id || contract?.contractId;

    return new Contract(this.account, contractId, {
      viewMethods: contract.viewMethods,
      changeMethods: contract.changeMethods,
    });
  }
}
