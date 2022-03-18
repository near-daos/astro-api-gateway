import { Injectable } from '@nestjs/common';

import { AccountChange, Transaction } from '@sputnik-v2/near-indexer';

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

  async handleNearIndexerAccountChanges(
    accountChanges: AccountChange[],
  ): Promise<Transaction[]> {
    const { actions, transactions } =
      await this.transactionActionMapperService.getActionsByNearIndexerAccountChanges(
        accountChanges,
      );
    const handledTransactions =
      await this.transactionActionHandlerService.handleTransactionActions(
        actions,
      );

    return transactions.filter((tx) =>
      handledTransactions.includes(tx.transactionHash),
    );
  }
}
