import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from 'src/daos/dao.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { isNotNull } from 'src/utils/guards';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import PromisePool from '@supercharge/promise-pool';

@Injectable()
export class DaoCronService {
  private readonly logger = new Logger(DaoCronService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sputnikDaoService: SputnikDaoService,
    private readonly daoService: DaoService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    const { daoPollingInterval } = this.configService.get('aggregator');

    const interval = setInterval(
      () => this.scheduleDaoUpdate(),
      daoPollingInterval,
    );
    schedulerRegistry.addInterval('dao-polling', interval);
  }

  public async scheduleDaoUpdate(): Promise<void> {
    this.logger.log('Updating DAO funds on schedule...');

    const daoIds = await this.sputnikDaoService.getDaoIds();

    const daos = [];

    const { errors } = await PromisePool.withConcurrency(5)
      .for(daoIds)
      .process(async (daoId) => {
        daos.push({
          id: daoId,
          amount: await this.sputnikDaoService.getDaoAmount(daoId),
        });

        return true;
      });

    this.logger.log('Storing DAO funds on schedule update...');
    await Promise.all(
      daos
        .filter((dao) => isNotNull(dao))
        .map((dao) => this.daoService.update(dao)),
    );
    this.logger.log('Successfully stored DAO funds.');
  }
}
