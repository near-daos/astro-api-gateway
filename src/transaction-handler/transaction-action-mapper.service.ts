import { Injectable } from '@nestjs/common';
import { NearApiService } from 'src/near-api/near-api.service';

import {
  castNearTransactionAction,
  TransactionAction,
} from './types/transaction-action';

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
}
