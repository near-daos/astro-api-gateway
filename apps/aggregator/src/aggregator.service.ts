import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
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
import {
  NFTTokenService,
  NFTTokenUpdateDto,
  TokenService,
  TokenUpdateDto,
} from '@sputnik-v2/token';

import { DaoAggregatorService } from './dao-aggregator/dao-aggregator.service';
import { ProposalAggregatorService } from './proposal-aggregator/proposal-aggregator.service';
import { BountyAggregatorService } from './bounty-aggregator/bounty-aggregator.service';
import { AggregatorState } from './aggregator-state/aggregator-state';
import { TokenAggregatorService } from './token-aggregator/token-aggregator.service';
import { NFTAggregatorService } from './token-aggregator/nft-aggregator.service';
import { StatsAggregatorService } from './stats-aggregator/stats-aggregator.service';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);
  private state = new AggregatorState();

  constructor(
    private readonly configService: ConfigService,
    private readonly nearIndexerService: NearIndexerService,
    private readonly transactionService: TransactionService,
    private readonly tokenService: TokenService,
    private readonly nftTokenService: NFTTokenService,
    private readonly daoService: DaoService,
    private readonly transactionHandlerService: TransactionHandlerService,
    private readonly daoAggregatorService: DaoAggregatorService,
    private readonly proposalAggregatorService: ProposalAggregatorService,
    private readonly bountyAggregatorService: BountyAggregatorService,
    private readonly tokenAggregatorService: TokenAggregatorService,
    private readonly nftAggregatorService: NFTAggregatorService,
    private readonly statsAggregatorService: StatsAggregatorService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly cacheService: CacheService,
  ) {
    const {
      pollingInterval,
      tokenPollingInterval,
      tokenPricesPollingInterval,
      daoStatusPollingInterval,
      daoStatsCronTime,
    } = this.configService.get('aggregator');

    schedulerRegistry.addInterval(
      'polling',
      setInterval(() => this.scheduleDaoAggregation(), pollingInterval),
    );

    schedulerRegistry.addInterval(
      'token_polling',
      setInterval(() => this.scheduleTokenAggregation(), tokenPollingInterval),
    );

    schedulerRegistry.addInterval(
      'token_prices_polling',
      setInterval(
        () => this.scheduleTokenPricesAggregation(),
        tokenPricesPollingInterval,
      ),
    );

    schedulerRegistry.addInterval(
      'dao_status_polling',
      setInterval(
        () => this.scheduleDaoStatusAggregation(),
        daoStatusPollingInterval,
      ),
    );

    const daoStatsCron = new CronJob(daoStatsCronTime, () =>
      this.handleDaoStatsCronAggregation(),
    );
    schedulerRegistry.addCronJob('dao_stats_cron', daoStatsCron);
    daoStatsCron.start();
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

      this.logger.error(`Token Aggregation failed with error: ${error}`);
    }

    try {
      await this.aggregateNFTs();
    } catch (error) {
      this.state.stopAggregation('nft');

      this.logger.error(`NFT Aggregation failed with error: ${error}`);
    }
  }

  public async scheduleTokenPricesAggregation(): Promise<void> {
    try {
      await this.aggregateTokenPrices();
    } catch (error) {
      this.state.stopAggregation('token-price');

      this.logger.error(`Token Prices Aggregation failed with error: ${error}`);
    }
  }

  public async scheduleDaoStatusAggregation(): Promise<void> {
    try {
      await this.aggregateDaoStatuses();
    } catch (error) {
      this.state.stopAggregation('dao-status');

      this.logger.error(`DAO Status Aggregation failed with error: ${error}`);
    }
  }

  public async handleDaoStatsCronAggregation(): Promise<void> {
    try {
      await this.aggregateDaoStats();
    } catch (error) {
      this.state.stopAggregation('dao-stats');

      this.logger.error(`DAO Stats Aggregation failed with error: ${error}`);
    }
  }

  public async aggregateTokens() {
    if (this.state.isInProgress('token')) {
      return;
    }

    const lastToken = await this.tokenService.lastToken();
    const timestamp = lastToken.updateTimestamp || lastToken.createTimestamp;

    this.logger.log(`Start Token aggregation...`);
    this.state.startAggregation('token');

    const { contractName } = this.configService.get('near');

    const newFtEvents = await this.nearIndexerService.findFTEventUpdates(
      contractName,
      timestamp,
    );

    if (newFtEvents.length === 0) {
      this.logger.log(
        `Skip aggregation for tokens. No new tokens transactions found`,
      );
      this.state.stopAggregation('token');
      return;
    }

    const tokenUpdates: TokenUpdateDto[] = newFtEvents.reduce(
      (updates, ftEvent) => {
        let accountId;
        const accountIdWildcard = `.${contractName}`;
        if (ftEvent.tokenNewOwnerAccountId.endsWith(accountIdWildcard)) {
          accountId = ftEvent.tokenNewOwnerAccountId;
        } else if (ftEvent.tokenOldOwnerAccountId.endsWith(accountIdWildcard)) {
          accountId = ftEvent.tokenOldOwnerAccountId;
        } else {
          return updates;
        }
        return [
          ...updates,
          {
            account: accountId,
            token: ftEvent.emittedByContractAccountId,
            timestamp: ftEvent.emittedAtBlockTimestamp,
          },
        ];
      },
      [],
    );

    const uniqueUpdates = tokenUpdates.filter((tokenUpdate, index) => {
      return (
        index ===
        tokenUpdates.findIndex(
          ({ token, account }) =>
            tokenUpdate.token === token && tokenUpdate.account === account,
        )
      );
    });

    this.logger.log(
      `Found token updates: ${uniqueUpdates.map(({ token }) => token)}`,
    );

    await this.tokenAggregatorService.aggregateDaoTokenUpdates(uniqueUpdates);

    await this.daoAggregatorService.aggregateDaoFunds([
      ...new Set(uniqueUpdates.map(({ account }) => account)),
    ]);

    // TODO: https://app.clickup.com/t/1ty89nk
    await this.cacheService.clearCache();

    this.logger.log(`Finished Token aggregation`);
    this.state.stopAggregation('token');
  }

  public async aggregateTokenPrices() {
    if (this.state.isInProgress('token-price')) {
      return;
    }

    this.logger.log(`Start Token Prices aggregation...`);
    this.state.startAggregation('token-price');

    const updatedTokens =
      await this.tokenAggregatorService.aggregateTokenPrices();

    this.logger.log(
      `Aggregate token prices: ${updatedTokens.map(({ id }) => id)}`,
    );

    await this.daoAggregatorService.aggregateDaoFunds();
    this.logger.log(`DAO Funds updated`);

    // TODO: https://app.clickup.com/t/1ty89nk
    await this.cacheService.clearCache();

    this.logger.log(`Finished Token Prices aggregation`);
    this.state.stopAggregation('token-price');
  }

  public async aggregateNFTs() {
    if (this.state.isInProgress('nft')) {
      return;
    }

    const lastToken = await this.nftTokenService.lastToken();
    const timestamp = lastToken.updateTimestamp || lastToken.createTimestamp;

    this.logger.log(`Start NFTs aggregation...`);
    this.state.startAggregation('nft');

    const { contractName } = this.configService.get('near');

    const newNftEvents = await this.nearIndexerService.findNFTEventUpdates(
      contractName,
      timestamp,
    );

    if (newNftEvents.length === 0) {
      this.logger.log(`Skip aggregation for NFTs. No new NFT events found`);
      this.state.stopAggregation('nft');
      return;
    }

    const tokenUpdates: NFTTokenUpdateDto[] = newNftEvents.reduce(
      (updates, nftEvent) => {
        let accountId;
        const accountIdWildcard = `.${contractName}`;
        if (nftEvent.tokenNewOwnerAccountId.endsWith(accountIdWildcard)) {
          accountId = nftEvent.tokenNewOwnerAccountId;
        } else if (
          nftEvent.tokenOldOwnerAccountId.endsWith(accountIdWildcard)
        ) {
          accountId = nftEvent.tokenOldOwnerAccountId;
        } else {
          return updates;
        }
        return [
          ...updates,
          {
            account: accountId,
            nft: nftEvent.emittedByContractAccountId,
            timestamp: nftEvent.emittedAtBlockTimestamp,
          },
        ];
      },
      [],
    );

    const uniqueTokenUpdates = tokenUpdates.filter(
      (tokenUpdate, index) =>
        index ===
        tokenUpdates.findIndex(
          ({ nft, account }) =>
            tokenUpdate.nft === nft && tokenUpdate.account === account,
        ),
    );

    this.logger.log(
      `Found NFT updates: ${uniqueTokenUpdates.map(({ nft }) => nft)}`,
    );

    await this.nftAggregatorService.aggregateDaoNFTUpdates(uniqueTokenUpdates);

    // TODO: https://app.clickup.com/t/1ty89nk
    await this.cacheService.clearCache();

    this.logger.log(`Finished NFTs aggregation`);
    this.state.stopAggregation('nft');
  }

  public async aggregateDaoStatuses() {
    if (this.state.isInProgress('dao-status')) {
      return;
    }

    this.logger.log(`Start Dao Status aggregation...`);
    this.state.startAggregation('dao-status');

    await this.daoAggregatorService.aggregateDaoStatuses();
    await this.cacheService.clearCache();

    this.logger.log(`Finished Dao Status aggregation`);
    this.state.stopAggregation('dao-status');
  }

  public async aggregateDaoStats() {
    if (this.state.isInProgress('dao-stats')) {
      return;
    }

    this.logger.log(`Start Dao Stats aggregation...`);
    this.state.startAggregation('dao-stats');

    await this.statsAggregatorService.aggregateAllDaoStats();

    this.logger.log(`Finished Dao Stats aggregation`);
    this.state.stopAggregation('dao-stats');
    await this.cacheService.clearCache();
  }

  // Sync service Database with transactions made after last aggregation
  public async aggregateNewDaoTransactions() {
    if (this.state.isInProgress('dao')) {
      return;
    }

    this.logger.log(`Start DAO aggregation...`);

    this.state.startAggregation('dao');

    await this.proposalAggregatorService.updateExpiredProposals();

    const { contractName } = this.configService.get('near');

    const lastTx = await this.transactionService.lastTransaction();
    const accountChangeActions =
      await this.nearIndexerService.findAccountChangeActionsByContractName(
        contractName,
        lastTx?.blockTimestamp,
      );

    // Filter account changes made after last transaction
    const newAccountChanges = accountChangeActions.filter((ac, i) => {
      const { transactionHash, blockTimestamp } =
        ac.causedByReceipt.originatedFromTransaction;
      const isAfterLastTx =
        !lastTx?.blockTimestamp || blockTimestamp > lastTx?.blockTimestamp;
      return (
        isAfterLastTx &&
        i ===
          accountChangeActions.findIndex(
            (ac) =>
              ac.causedByReceipt.originatedFromTransaction.transactionHash ===
              transactionHash,
          )
      );
    });

    if (newAccountChanges.length === 0) {
      this.logger.log('Skip DAO Aggregation. No changes found.');
      this.state.stopAggregation('dao');
      return;
    }

    this.logger.log(`Found transactions: ${newAccountChanges.length}`);
    const transactions =
      await this.transactionHandlerService.handleNearIndexerAccountChanges(
        newAccountChanges,
      );

    this.logger.log('Storing aggregated Transactions...');
    await this.transactionService.createMultiple(transactions);

    this.logger.log(
      `Successfully aggregated transactions: ${transactions.length}/${newAccountChanges.length}`,
    );
    // TODO: https://app.clickup.com/t/1ty89nk
    await this.cacheService.clearCache();

    this.state.stopAggregation('dao');
  }

  // Aggregate new transactions for each dao
  public async aggregateAllDaos() {
    this.logger.log(`Start all DAO aggregation`);

    this.state.startAggregations([
      'dao',
      'token',
      'nft',
      'token-price',
      'dao-status',
    ]);

    await this.tokenAggregatorService.aggregateTokenPrices();

    const tx = await this.transactionService.lastTransaction();
    const { contractName } = this.configService.get('near');
    const daoAccounts =
      await this.nearIndexerService.findAccountsByContractName(contractName);

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

    await PromisePool.withConcurrency(5)
      .for(daoAccounts)
      .process(
        async (daoAccount) => await this.aggregateDaoNFTs(daoAccount, tx),
      );

    this.state.stopAggregations([
      'dao',
      'token',
      'nft',
      'token-price',
      'dao-status',
    ]);
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
      await this.bountyAggregatorService.aggregateBountiesByDao(
        dao,
        daoTransactions,
      );
      await this.proposalAggregatorService.aggregateProposalsByDao(
        dao,
        daoTransactions,
      );
      await this.daoAggregatorService.aggregateDaoAdditionalFields(dao);

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

  public async aggregateDaoNFTs(account: Account, tx?: Transaction) {
    this.logger.log(`Start aggregation NFTs for DAO: ${account.accountId}`);

    try {
      const { nftWhitelistContracts } = this.configService.get('near');
      const nftLikelyIds = await this.nearIndexerService.findLikelyNFTs(
        account.accountId,
      );
      const nftIds = [...nftLikelyIds, ...nftWhitelistContracts];

      if (nftIds.length === 0) {
        this.logger.log(
          `Skip NFT aggregation for DAO: ${account.accountId}. No NFTs found`,
        );
        return;
      }

      await this.nftAggregatorService.aggregateDaoNFTs(
        account.accountId,
        nftIds,
        tx?.blockTimestamp,
      );

      this.logger.log(
        `Successfully aggregated DAO: ${account.accountId} NFTs: ${nftIds}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed NFT aggregation for DAO: ${account.accountId}. Error: ${error}`,
      );
    }
  }

  public async aggregateDaoById(daoId: string) {
    const aggregationName = `dao-${daoId}`;

    if (this.state.isInProgress(aggregationName)) {
      this.logger.log(`Skip DAO aggregation. Already in progress`);
      return;
    }

    this.logger.log(`Start aggregation for DAO: ${daoId}`);

    this.state.startAggregation(aggregationName);

    try {
      const dao = await this.daoAggregatorService.aggregateDaoById(daoId);
      await this.proposalAggregatorService.aggregateProposalsByDao(dao, []);
      await this.bountyAggregatorService.aggregateBountiesByDao(dao, []);
      await this.daoAggregatorService.aggregateDaoAdditionalFields(dao);

      this.logger.log(`Successfully aggregated DAO: ${daoId}`);
    } catch (error) {
      this.logger.error(`Failed DAO aggregation ${daoId}. Error: ${error}`);
    }

    this.state.stopAggregation(aggregationName);
  }
}
