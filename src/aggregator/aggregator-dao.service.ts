import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from 'src/daos/dao.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { isNotNull } from 'src/utils/guards';
import { NearService } from 'src/near/near.service';
import { TransactionService } from 'src/transactions/transaction.service';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { EventService } from 'src/events/events.service';
import { AccountChangeService } from 'src/transactions/account-change.service';
import { AccountChange } from 'src/near/entities/account-change.entity';

@Injectable()
export class AggregatorDaoService {
  private readonly logger = new Logger(AggregatorDaoService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sputnikDaoService: SputnikDaoService,
    private readonly daoService: DaoService,
    private readonly nearService: NearService,
    private readonly transactionService: TransactionService,
    private readonly accountChangeService: AccountChangeService,
    private readonly eventService: EventService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    const { pollingInterval } = this.configService.get('aggregator-dao');

    const interval = setInterval(
      () => this.scheduleAggregation(),
      pollingInterval,
    );
    schedulerRegistry.addInterval('polling', interval);
  }

  public async scheduleAggregation(): Promise<void> {
    const accChange = await this.accountChangeService.lastAccountChange();
    if (!accChange) {
      // Skipping cron job scheduling until the very 1st aggregation completes.
      return;
    }

    this.logger.debug('Scheduling Data Aggregation...');

    return this.aggregate(accChange);
  }

  public async aggregate(lastAccChange?: AccountChange): Promise<void> {
    const { contractName } = this.configService.get('near');

    this.logger.debug('Checking data relevance...');
    const accChange =
      lastAccChange || (await this.accountChangeService.lastAccountChange());

    let blockTimestamp = accChange?.changedInBlockTimestamp;
    if (!blockTimestamp) {
      const tx = await this.transactionService.lastTransaction();

      blockTimestamp = tx?.blockTimestamp;
    }
    
    const nearAccChange =
      await this.nearService.findLastAccountChangesByContractName(
        contractName,
        blockTimestamp,
      );

    if (
      accChange &&
      accChange.changedInBlockTimestamp ===
        nearAccChange?.changedInBlockTimestamp
    ) {
      return this.logger.debug('Data is up to date. Skipping data aggregation.');
    }

    const accountChanges =
      await this.nearService.findAccountChangesByContractName(
        contractName,
        blockTimestamp,
      );

    const updatedDaoIds = Array.from(
      new Set(accountChanges.map(({ affectedAccountId }) => affectedAccountId)),
    );

    this.logger.log(`DAOs updated: ${updatedDaoIds.join(',')}`);

    let startTime = new Date().getTime();
    const [daos] = await Promise.all([
      this.sputnikDaoService.getDaoList(updatedDaoIds),
    ]);
    const aggregationTime = new Date().getTime();
    this.logger.log(
      `Smart Contract aggregation time: ${aggregationTime - startTime} ms`,
    );

    this.logger.log('Persisting aggregated DAOs...');
    await Promise.all(
      daos
        .filter((dao) => isNotNull(dao))
        .map((dao) => this.daoService.create(dao)),
    );
    this.logger.log('Finished DAO aggregation.');

    this.logger.log('Persisting aggregated Account Changes...');
    await Promise.all(
      accountChanges.map((accountChange) =>
        this.accountChangeService.create(accountChange),
      ),
    );
    this.logger.log('Finished Account Changes aggregation.');

    this.logger.log('Sending DAO updates...');
    this.eventService.sendDaoUpdates(daos);
  }
}
