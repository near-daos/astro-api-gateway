import { Injectable } from '@nestjs/common';

import { AccountChange } from '@sputnik-v2/near-indexer';

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

  async handleNearIndexerAccountChanges(accountChanges: AccountChange[]) {
    const actions =
      this.transactionActionMapperService.getActionsByNearIndexerAccountChanges(
        accountChanges,
      );
    await this.transactionActionHandlerService.handleTransactionActions(
      actions,
    );
  }
}
