import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  NearIndexerService,
  Receipt,
  Transaction,
} from '@sputnik-v2/near-indexer';
import { INDEXER_PROCESSOR_HANDLER_STATE_ID } from '@sputnik-v2/common';

import { TransactionActionMapperService } from './transaction-action-mapper.service';
import { TransactionActionHandlerService } from './transaction-action-handler.service';
import { TransactionHandlerState } from './entities';
import { ContractHandlerResult, TransactionHandlerStatus } from './types';
import { TransactionHandlerBlocks } from './dto';

@Injectable()
export class TransactionHandlerService {
  private readonly logger = new Logger(TransactionHandlerService.name);

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

  async getStateBlock(id: string) {
    const state = await this.getState(id);
    if (!state) {
      return;
    }
    const { lastBlockHash } = state;
    return this.nearIndexerService.findBlockByHash(lastBlockHash);
  }

  async getHandlerBlocks(): Promise<TransactionHandlerBlocks> {
    try {
      const processorBlock = await this.getStateBlock(
        INDEXER_PROCESSOR_HANDLER_STATE_ID,
      );
      const lastAccountChange =
        await this.nearIndexerService.lastAccountChange();
      const lastAstroBlock = await this.nearIndexerService.findBlockByTimestamp(
        lastAccountChange?.changedInBlockTimestamp,
      );
      const lastNearLakeBlock =
        await this.nearIndexerService.lastNearLakeBlock();
      const lastHandledBlock =
        processorBlock?.blockTimestamp > lastAstroBlock?.blockTimestamp
          ? lastAstroBlock
          : processorBlock;
      return {
        lastBlock: {
          height: lastNearLakeBlock?.blockHeight,
          timestamp: lastNearLakeBlock?.blockTimestamp,
        },
        lastAstroBlock: {
          height: lastAstroBlock?.blockHeight,
          timestamp: lastAstroBlock?.blockTimestamp,
        },
        lastHandledBlock: {
          height: lastHandledBlock?.blockHeight,
          timestamp: lastHandledBlock?.blockTimestamp,
        },
        lastProcessedBlock: {
          height: processorBlock?.blockHeight,
          timestamp: processorBlock?.blockTimestamp,
        },
      };
      // Fallback flow in case of using public indexer database
    } catch (err) {
      this.logger.error(`Failed to query handler blocks with error: ${err}`);
      return {
        lastBlock: {
          height: '0',
          timestamp: '0',
        },
        lastAstroBlock: {
          height: '0',
          timestamp: '0',
        },
        lastHandledBlock: {
          height: '0',
          timestamp: '0',
        },
        lastProcessedBlock: {
          height: '0',
          timestamp: '0',
        },
      };
    }
  }

  async saveState(
    id: string,
    status: TransactionHandlerStatus,
    lastTx?: Partial<Transaction>,
  ): Promise<TransactionHandlerState> {
    return this.transactionHandlerStateRepository.save({
      id,
      lastBlockHash: lastTx?.includedInBlockHash,
      lastBlockTimestamp: lastTx?.blockTimestamp,
      status,
    });
  }

  async handleNearTransaction(
    transactionHash: string,
    accountId: string,
  ): Promise<ContractHandlerResult[]> {
    const actions =
      await this.transactionActionMapperService.getActionsByNearTransaction(
        transactionHash,
        accountId,
      );
    const { results, success } =
      await this.transactionActionHandlerService.handleTransactionActions(
        actions,
      );

    if (!success) {
      throw new Error(
        `Failed to handle actions of transaction ${transactionHash}`,
      );
    }

    return results;
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
