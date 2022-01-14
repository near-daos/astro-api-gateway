import { Injectable } from '@nestjs/common';
import { NearApiService } from '@sputnik-v2/near-api';
import { AccountChange } from '@sputnik-v2/near-indexer';
import { sleep } from '@sputnik-v2/utils';

import {
  castNearIndexerReceiptAction,
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

    return txStatus.receipts
      .map((receipt) =>
        receipt.receipt.Action.actions.map((action) =>
          castNearTransactionAction(transactionHash, receipt, action),
        ),
      )
      .flat();
  }

  getActionsByNearIndexerAccountChanges(
    accountChanges: AccountChange[],
  ): TransactionAction[] {
    return accountChanges
      .map((ac) =>
        ac.causedByReceipt.receiptActions.map((action) =>
          castNearIndexerReceiptAction(ac.causedByReceipt, action),
        ),
      )
      .flat();
  }
}
