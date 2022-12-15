import { Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';

import { DaoService } from '@sputnik-v2/dao';
import { DaoStats, DaoStatsService } from '@sputnik-v2/stats';
import { ReturnValue } from '@supercharge/promise-pool/dist/return-value';

@Injectable()
export class StatsAggregatorService {
  private readonly logger = new Logger(StatsAggregatorService.name);

  constructor(
    private readonly daoService: DaoService,
    private readonly daoStatsService: DaoStatsService,
  ) {}

  public async aggregateAllDaoStats(): Promise<ReturnValue<string, DaoStats>> {
    const daoIds = await this.daoService.findDaoIds();
    return PromisePool.withConcurrency(5)
      .for(daoIds)
      .handleError((err, daoId) => {
        this.logger.error(
          `Failed dao stats aggregation for ${daoId}: ${err} (${err.stack})`,
        );
      })
      .process((daoId) => this.aggregateDaoStatsById(daoId));
  }

  public async aggregateDaoStatsById(daoId: string): Promise<DaoStats> {
    const daoStats = await this.daoStatsService.getDaoStats(daoId);
    return this.daoStatsService.create(daoStats);
  }
}
