import { Injectable } from '@nestjs/common';
import { NearApiService } from '@sputnik-v2/near-api';
import { Transaction } from '@sputnik-v2/near-indexer';

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
    const txStatus = await this.nearApiService.getTxStatus(
      transactionHash,
      accountId,
    );

    return txStatus.transaction.actions.map((action) =>
      castNearTransactionAction(txStatus, action),
    );
  }

  async getActionsByNearIndexerTransactions(
    transactions: Transaction[],
  ): Promise<TransactionAction[]> {
    return transactions.map((tx) => castNearIndexerTransactionAction(tx));
  }
}
