import { Injectable } from '@nestjs/common';
import { NearApiService } from '@sputnik-v2/near-api';

import {
  ActionReceiptAction,
  castTransactionAction,
  ReceiptEntry,
} from './types/receipt-entry';

@Injectable()
export class IndexerProcessorCommonService {
  constructor(private readonly nearApiService: NearApiService) {}

  async getTransactionAction(
    receipt: ReceiptEntry,
    action: ActionReceiptAction,
  ) {
    const txStatus = await this.nearApiService.getTxStatusRetry(
      receipt.originated_from_transaction_hash,
      receipt.predecessor_account_id,
    );

    const outcome = txStatus.receipts_outcome.find(
      (outcome) => outcome.id === receipt.receipt_id,
    );

    if (!outcome) {
      throw new Error(
        `Unable to fund outcome for receipt ID: ${receipt.receipt_id}`,
      );
    }

    return castTransactionAction(txStatus, receipt, outcome, action);
  }
}
