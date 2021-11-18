import { Injectable } from '@nestjs/common';

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
}
