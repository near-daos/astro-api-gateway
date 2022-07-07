import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Receipt, Transaction } from '@sputnik-v2/near-indexer';

import { TransactionActionMapperService } from './transaction-action-mapper.service';
import { TransactionActionHandlerService } from './transaction-action-handler.service';
import { TransactionHandlerState } from './entities';

@Injectable()
export class TransactionHandlerService {
  constructor(
    @InjectRepository(TransactionHandlerState)
    private readonly transactionHandlerStateRepository: Repository<TransactionHandlerState>,
    private readonly transactionActionMapperService: TransactionActionMapperService,
    private readonly transactionActionHandlerService: TransactionActionHandlerService,
  ) {}

  async getState(id: string): Promise<TransactionHandlerState> {
    return this.transactionHandlerStateRepository.findOne(id);
  }

  async saveState(
    id: string,
    lastTx: Transaction,
  ): Promise<TransactionHandlerState> {
    return this.transactionHandlerStateRepository.save({
      id,
      lastBlockHash: lastTx.includedInBlockHash,
      lastBlockTimestamp: lastTx.blockTimestamp,
    });
  }

  async handleNearTransaction(transactionHash: string, accountId: string) {
    const actions =
      await this.transactionActionMapperService.getActionsByNearTransaction(
        transactionHash,
        accountId,
      );
    const successActions =
      await this.transactionActionHandlerService.handleTransactionActions(
        actions,
      );

    if (successActions.length !== actions.length) {
      throw new Error(
        `Failed to handle actions of transaction ${transactionHash}`,
      );
    }
  }

  async handleNearReceipts(receipts: Receipt[]): Promise<Transaction[]> {
    const { actions, transactions } =
      await this.transactionActionMapperService.getActionsByReceipts(receipts);
    const handledTransactions =
      await this.transactionActionHandlerService.handleTransactionActions(
        actions,
      );

    return transactions.filter((tx) =>
      handledTransactions.includes(tx.transactionHash),
    );
  }
}
