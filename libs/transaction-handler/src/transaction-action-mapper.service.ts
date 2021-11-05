import { Injectable } from '@nestjs/common';
import { NearApiService } from '@sputnik-v2/near-api';

import { castNearTransactionAction, TransactionAction } from './types';

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
