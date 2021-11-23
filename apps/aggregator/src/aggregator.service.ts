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
import { CacheService } from '@sputnik-v2/cache';
import { TokenService } from '@sputnik-v2/token';

import { DaoAggregatorService } from './dao-aggregator/dao-aggregator.service';
import { ProposalAggregatorService } from './proposal-aggregator/proposal-aggregator.service';
import { BountyAggregatorService } from './bounty-aggregator/bounty-aggregator.service';
import { AggregatorState } from './aggregator-state/aggregator-state';
import { TokenAggregatorService } from './token-aggregator/token-aggregator.service';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);
  private state = new AggregatorState();

  constructor(
    private readonly configService: ConfigService,
    private readonly nearIndexerService: NearIndexerService,
    private readonly transactionService: TransactionService,
    private readonly tokenService: TokenService,
    private readonly daoService: DaoService,
    private readonly transactionHandlerService: TransactionHandlerService,
    private readonly daoAggregatorService: DaoAggregatorService,
    private readonly proposalAggregatorService: ProposalAggregatorService,
    private readonly bountyAggregatorService: BountyAggregatorService,
    private readonly tokenAggregatorService: TokenAggregatorService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly cacheService: CacheService,
  ) {
    const { pollingInterval, tokenPollingInterval } =
      this.configService.get('aggregator');

    schedulerRegistry.addInterval(
      'polling',
      setInterval(() => this.scheduleDaoAggregation(), pollingInterval),
    );

    schedulerRegistry.addInterval(
      'token_polling',
      setInterval(() => this.scheduleTokenAggregation(), tokenPollingInterval),
    );
  }

  public async scheduleDaoAggregation(): Promise<void> {
    try {
      await this.aggregateNewDaoTransactions();
    } catch (error) {
      this.state.stopAggregation('dao');

      this.logger.log(`DAO Aggregation failed with error: ${error}`);
    }
  }

  public async scheduleTokenAggregation(): Promise<void> {
    try {
      await this.aggregateTokens();
    } catch (error) {
      this.state.stopAggregation('token');

      this.logger.log(`Token Aggregation failed with error: ${error}`);
    }
  }

  public async aggregateTokens() {
    if (this.state.isInProgress('token')) {
      return;
    }

    this.logger.log(`Start Token aggregation...`);
    this.state.startAggregation('token');

    const lastToken = await this.tokenService.lastToken();
    const { contractName } = this.configService.get('near');
    const daoTokenUpdates =
      await this.nearIndexerService.findLikelyTokenUpdates(
        `%.${contractName}%`,
        lastToken.updateTimestamp || lastToken.createTimestamp,
      );

    if (daoTokenUpdates.length === 0) {
      this.logger.log(`Skip aggregation for Tokens. No new transactions found`);
      this.state.stopAggregation('token');
      return;
    }

    const uniqueUpdates = daoTokenUpdates.filter((tokenUpdate, index) => {
      return (
        index ===
        daoTokenUpdates.findIndex(
          ({ token, account }) =>
            tokenUpdate.token === token && tokenUpdate.account === account,
        )
      );
    });

    this.logger.log(
      `Found token updates: ${uniqueUpdates.map(({ token }) => token)}`,
    );

    await this.tokenAggregatorService.aggregateDaoTokenUpdates(uniqueUpdates);

    // TODO: https://app.clickup.com/t/1ty89nk
    await this.cacheService.clearCache();

    this.logger.log(`Finished Token aggregation`);
    this.state.stopAggregation('token');
  }

  // Sync service Database with transactions made after last aggregation
  public async aggregateNewDaoTransactions() {
    if (this.state.isInProgress('dao')) {
      return;
    }

    this.logger.log(`Start DAO aggregation...`);

    this.state.startAggregation('dao');

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
      this.logger.log('Skip DAO Aggregation. No new transactions found.');
      this.state.stopAggregation('dao');
      return;
    }

    await this.transactionHandlerService.handleNearIndexerTransactions(
      transactions,
    );

    this.logger.log('Storing aggregated Transactions...');
    await this.transactionService.createMultiple(transactions);

    // TODO: https://app.clickup.com/t/1ty89nk
    await this.cacheService.clearCache();

    this.state.stopAggregation('dao');
  }

  // Aggregate new transactions for each dao
  public async aggregateAllDaos() {
    this.logger.log(`Start all DAO aggregation`);

    this.state.startAggregations(['dao', 'token']);

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

    await PromisePool.withConcurrency(5)
      .for(daoAccounts)
      .process(
        async (daoAccount) => await this.aggregateDaoTokens(daoAccount, tx),
      );

    this.state.stopAggregations(['dao', 'token']);
    this.logger.log(`Finished all DAO aggregation`);
  }

  public async aggregateDaoByAccount(account: Account, tx?: Transaction) {
    this.logger.log(`Start aggregation for DAO: ${account.accountId}`);

    const daoTransactions =
      await this.nearIndexerService.findTransactionsByAccountIds(
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

  public async aggregateDaoTokens(account: Account, tx?: Transaction) {
    this.logger.log(`Start aggregation tokens for DAO: ${account.accountId}`);

    try {
      const daoTokenIds = await this.nearIndexerService.findLikelyTokens(
        account.accountId,
      );

      if (daoTokenIds.length === 0) {
        this.logger.log(
          `Skip token aggregation for DAO: ${account.accountId}. No tokens found`,
        );
        return;
      }

      await this.tokenAggregatorService.aggregateDaoTokens(
        account.accountId,
        daoTokenIds,
        tx?.blockTimestamp,
      );

      this.logger.log(
        `Successfully aggregated DAO: ${account.accountId} Tokens: ${daoTokenIds}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed aggregation DAO: ${account.accountId}. Error: ${error}`,
      );
    }
  }
}
