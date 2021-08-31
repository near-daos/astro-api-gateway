import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from 'src/daos/dao.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DAO_PENDING_CLEAN_THRESHOLD_IN_MILLIS } from 'src/common/constants';

@Injectable()
export class GarbageCollectorService {
  private readonly logger = new Logger(GarbageCollectorService.name);

  constructor(private readonly daoService: DaoService) {}

  @Cron(CronExpression.EVERY_WEEK)
  public async cleanPendingDaos(): Promise<void> {
    this.logger.log('Purging outdated pending DAOs...');

    const deleteResult = await this.daoService.clearPendingDaos(
      new Date(Date.now() - DAO_PENDING_CLEAN_THRESHOLD_IN_MILLIS),
    );

    if (deleteResult.affected) {
      this.logger.log(`Successfully purged ${deleteResult.affected} DAOs.`);
    }

    this.logger.log('Finished outdated pending DAOs purge.');
  }
}
