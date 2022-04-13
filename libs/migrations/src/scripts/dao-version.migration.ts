import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from '@sputnik-v2/dao';

import { Migration } from '..';
import PromisePool from '@supercharge/promise-pool';

@Injectable()
export class DaoVersionsMigration implements Migration {
  private readonly logger = new Logger(DaoVersionsMigration.name);

  constructor(private readonly daoService: DaoService) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting DAO Versions migration...');

    this.logger.log('Collecting DAOs...');
    const allDaos = await this.daoService.find();

    this.logger.log('Load DAO versions...');
    const daoVersions = await this.daoService.loadDaoVersions();
    this.logger.log(
      `Loaded DAO versions ${daoVersions
        .map(({ hash }) => hash)
        .join(', ')}...`,
    );

    this.logger.log(`Set DAOs version...`);
    const { results, errors } = await PromisePool.withConcurrency(1)
      .for(allDaos)
      .process(async ({ id }) => this.daoService.setDaoVersion(id));

    this.logger.log(
      `Successfully updated DAOs: ${results.length}. Errors: ${errors.length}`,
    );
    this.logger.log(' DAO Versions Hash migration finished.');
  }
}
