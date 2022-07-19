import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  NearIndexerService,
  Receipt,
  Transaction,
} from '@sputnik-v2/near-indexer';

import { TransactionActionMapperService } from './transaction-action-mapper.service';
import { TransactionActionHandlerService } from './transaction-action-handler.service';
import { TransactionHandlerState } from './entities';
import { TransactionHandlerStatus } from '@sputnik-v2/transaction-handler/types';
import { TransactionHandlerBlocks } from '@sputnik-v2/transaction-handler/dto';

@Injectable()
export class TransactionHandlerService {
  constructor(
    @InjectRepository(TransactionHandlerState)
    private readonly transactionHandlerStateRepository: Repository<TransactionHandlerState>,
    private readonly transactionActionMapperService: TransactionActionMapperService,
    private readonly transactionActionHandlerService: TransactionActionHandlerService,
    private readonly nearIndexerService: NearIndexerService,
  ) {}

  async getState(id: string): Promise<TransactionHandlerState> {
    return this.transactionHandlerStateRepository.findOne(id);
  }

  async getHandlerBlocks(id: string): Promise<TransactionHandlerBlocks> {
    const state = await this.getState(id);
    const stateBlock = await this.nearIndexerService.findBlockByHash(
      state.lastBlockHash,
    );
    const lastBlock = await this.nearIndexerService.lastBlock();
    const lastNearLakeBlock = await this.nearIndexerService.lastNearLakeBlock();
    return {
      lastBlock: lastNearLakeBlock.blockHeight,
      lastAstroBlock: lastBlock.blockHeight,
      lastHandledBlock: stateBlock.blockHeight,
    };
  }

  async saveState(
    id: string,
    status: TransactionHandlerStatus,
    lastTx?: Transaction,
  ): Promise<TransactionHandlerState> {
    return this.transactionHandlerStateRepository.save({
      id,
      lastBlockHash: lastTx?.includedInBlockHash,
      lastBlockTimestamp: lastTx?.blockTimestamp,
      status,
    });
  }

  async handleNearTransaction(transactionHash: string, accountId: string) {
    const actions =
      await this.transactionActionMapperService.getActionsByNearTransaction(
        transactionHash,
        accountId,
      );
    const { success } =
      await this.transactionActionHandlerService.handleTransactionActions(
        actions,
      );

    if (!success) {
      throw new Error(
        `Failed to handle actions of transaction ${transactionHash}`,
      );
    }
  }

  async handleNearReceipts(
    receipts: Receipt[],
  ): Promise<{ transactions: Transaction[]; success: boolean }> {
    const { actions, transactions } =
      await this.transactionActionMapperService.getActionsByReceipts(receipts);
    const { handledTxHashes, success } =
      await this.transactionActionHandlerService.handleTransactionActions(
        actions,
      );

    return {
      transactions: transactions.filter((tx) =>
        handledTxHashes.includes(tx.transactionHash),
      ),
      success,
    };
  }
}
