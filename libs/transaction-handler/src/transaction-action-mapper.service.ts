import { Injectable } from '@nestjs/common';
import { NearApiService } from '@sputnik-v2/near-api';
import { Transaction } from '@sputnik-v2/near-indexer';
import { sleep } from '@sputnik-v2/utils';

import {
  castNearIndexerTransactionAction,
  castNearTransactionAction,
  TransactionAction,
} from './types';

@Injectable()
export class TransactionActionMapperService {
  constructor(private readonly nearApiService: NearApiService) {}

  async getActionsByNearTransaction(
    transactionHash: string,
    accountId: string,
  ): Promise<TransactionAction[]> {
    let txStatus;

    try {
      txStatus = await this.nearApiService.getTxStatus(
        transactionHash,
        accountId,
      );
    } catch (error) {
      // Wait 3 seconds before retry
      await sleep(3000);
      txStatus = await this.nearApiService.getTxStatus(
        transactionHash,
        accountId,
      );
    }

    return txStatus.transaction.actions.map((action) =>
      castNearTransactionAction(txStatus, action),
    );
  }

  getActionsByNearIndexerTransactions(
    transactions: Transaction[],
  ): TransactionAction[] {
    return transactions.map((tx) => castNearIndexerTransactionAction(tx));
  }
}
