import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import PromisePool from '@supercharge/promise-pool';

import {
  Account,
  NearIndexerService,
  Transaction,
} from '@sputnik-v2/near-indexer';
import { TransactionService } from '@sputnik-v2/transaction';
import { DaoService } from '@sputnik-v2/dao';
import { TransactionHandlerService } from '@sputnik-v2/transaction-handler';

import { DaoAggregatorService } from './dao-aggregator/dao-aggregator.service';
import { ProposalAggregatorService } from './proposal-aggregator/proposal-aggregator.service';
import { BountyAggregatorService } from './bounty-aggregator/bounty-aggregator.service';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);
  private isAggregationInProgress: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly nearIndexerService: NearIndexerService,
    private readonly transactionService: TransactionService,
    private readonly daoService: DaoService,
    private readonly transactionHandlerService: TransactionHandlerService,
    private readonly daoAggregatorService: DaoAggregatorService,
    private readonly proposalAggregatorService: ProposalAggregatorService,
    private readonly bountyAggregatorService: BountyAggregatorService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    const { pollingInterval } = this.configService.get('aggregator');

    const interval = setInterval(
      () => this.scheduleAggregation(),
      pollingInterval,
    );
    schedulerRegistry.addInterval('polling', interval);
  }

  public async scheduleAggregation(): Promise<void> {
    try {
      await this.aggregateNewTransactions();
    } catch (error) {
      this.isAggregationInProgress = false;

      this.logger.log(`Aggregation failed with error: ${error}`);
    }
  }

  // Sync service Database with transactions made after last aggregation
  public async aggregateNewTransactions() {
    if (this.isAggregationInProgress) {
      return;
    }

    this.logger.log(`Start aggregation...`);

    this.isAggregationInProgress = true;

    const { contractName } = this.configService.get('near');

    const lastTx = await this.transactionService.lastTransaction();
    const accountChangeActions =
      await this.nearIndexerService.findAccountChangeActionsByContractName(
        `${contractName}`,
        lastTx?.blockTimestamp,
      );

    // Map account changes to list of unique transactions made after last transaction
    const transactions = accountChangeActions
      .map(
        (accountChange) =>
          accountChange.causedByReceipt.originatedFromTransaction,
      )
      .filter(({ transactionHash, blockTimestamp }, index) => {
        const isAfterLastTx =
          !lastTx?.blockTimestamp || blockTimestamp > lastTx?.blockTimestamp;
        return (
          isAfterLastTx &&
          index ===
            accountChangeActions.findIndex(
              (accountChange) =>
                accountChange.causedByReceipt.originatedFromTransaction
                  .transactionHash === transactionHash,
            )
        );
      });

    if (transactions.length === 0) {
      this.logger.log('Skip Aggregation. No new transactions found.');
      this.isAggregationInProgress = false;
      return;
    }

    await this.transactionHandlerService.handleNearIndexerTransactions(
      transactions,
    );

    this.logger.log('Storing aggregated Transactions...');
    await this.transactionService.createMultiple(transactions);

    this.isAggregationInProgress = false;
  }

  // Aggregate new transactions for each dao
  public async aggregateAllDaos() {
    if (this.isAggregationInProgress) {
      return;
    }

    this.logger.log(`Start all DAO aggregation`);

    this.isAggregationInProgress = true;

    const tx = await this.transactionService.lastTransaction();
    const { contractName } = this.configService.get('near');
    const daoAccounts =
      await this.nearIndexerService.findAccountsByContractName(
        `.${contractName}`,
      );

    await PromisePool.withConcurrency(5)
      .for(daoAccounts)
      .process(
        async (daoAccount) => await this.aggregateDaoByAccount(daoAccount, tx),
      );

    this.isAggregationInProgress = false;
    this.logger.log(`Finished all DAO aggregation`);
  }

  public async aggregateDaoByAccount(account: Account, tx?: Transaction) {
    this.logger.log(`Start aggregation for DAO: ${account.accountId}`);

    const daoTransactions =
      await this.nearIndexerService.findTransactionsByContractName(
        account.accountId,
        tx?.blockTimestamp,
      );
    const daoById = await this.daoService.findOne(account.accountId);

    if (
      daoById &&
      (daoTransactions.length === 0 ||
        daoTransactions[daoTransactions.length - 1].blockTimestamp ===
          tx?.blockTimestamp)
    ) {
      this.logger.log(
        `Skip aggregation for DAO: ${account.accountId}. No new transactions found`,
      );
      return;
    }

    try {
      const dao = await this.daoAggregatorService.aggregateByAccount(
        account,
        daoTransactions,
      );
      await this.proposalAggregatorService.aggregateProposalsByDao(
        dao,
        daoTransactions,
      );
      await this.bountyAggregatorService.aggregateBountiesByDao(
        dao,
        daoTransactions,
      );

      this.logger.log('Storing aggregated Transactions...');
      await this.transactionService.createMultiple(daoTransactions);

      this.logger.log(`Successfully aggregated DAO: ${account.accountId}`);
    } catch (error) {
      this.logger.error(
        `Failed DAO aggregation ${account.accountId}. Error: ${error}`,
      );
    }
  }
}
