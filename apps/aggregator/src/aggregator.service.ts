import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { NearIndexerService } from '@sputnik-v2/near-indexer';
import { TransactionService } from '@sputnik-v2/transaction';
import { DaoService } from '@sputnik-v2/dao';
import { TransactionHandlerService } from '@sputnik-v2/transaction-handler';
import { CacheService } from '@sputnik-v2/cache';
import { NFTTokenService, TokenService } from '@sputnik-v2/token';

import { DaoAggregatorService } from './dao-aggregator/dao-aggregator.service';
import { ProposalAggregatorService } from './proposal-aggregator/proposal-aggregator.service';
import { BountyAggregatorService } from './bounty-aggregator/bounty-aggregator.service';
import { AggregatorState } from './aggregator-state/aggregator-state';
import { TokenAggregatorService } from './token-aggregator/token-aggregator.service';
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
    private readonly statsAggregatorService: StatsAggregatorService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly cacheService: CacheService,
  ) {
    const {
      expiredProposalsPollingInterval,
      tokenPricesPollingInterval,
      daoStatusPollingInterval,
      daoStatsCronTime,
    } = this.configService.get('aggregator');

    schedulerRegistry.addInterval(
      'expired_proposals_polling',
      setInterval(
        () => this.scheduleExpiredProposalsAggregation(),
        expiredProposalsPollingInterval,
      ),
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

  public async scheduleExpiredProposalsAggregation(): Promise<void> {
    if (this.state.isInProgress('expired-proposals')) {
      return;
    }

    try {
      this.logger.log(`Expired Proposals Aggregation...`);
      await this.proposalAggregatorService.updateExpiredProposals();
    } catch (error) {
      this.logger.error(
        `Expired Proposals Aggregation failed with error: ${error}`,
      );
    }

    this.state.stopAggregation('expired-proposals');
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
