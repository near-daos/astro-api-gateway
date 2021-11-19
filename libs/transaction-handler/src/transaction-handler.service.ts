import { Injectable } from '@nestjs/common';

import { Transaction } from '@sputnik-v2/near-indexer';

import { TransactionActionMapperService } from './transaction-action-mapper.service';
import { TransactionActionHandlerService } from './transaction-action-handler.service';

@Injectable()
export class TransactionHandlerService {
  constructor(
    private readonly transactionActionMapperService: TransactionActionMapperService,
    private readonly transactionActionHandlerService: TransactionActionHandlerService,
  ) {}

  async handleNearTransaction(transactionHash: string, accountId: string) {
    const actions =
      await this.transactionActionMapperService.getActionsByNearTransaction(
        transactionHash,
        accountId,
      );
    await this.transactionActionHandlerService.handleTransactionActions(
      actions,
    );
  }

  async handleNearIndexerTransactions(transactions: Transaction[]) {
    const actions =
      this.transactionActionMapperService.getActionsByNearIndexerTransactions(
        transactions,
      );
    await this.transactionActionHandlerService.handleTransactionActions(
      actions,
    );
  }
}
