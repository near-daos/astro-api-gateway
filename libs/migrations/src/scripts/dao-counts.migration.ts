import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from '@sputnik-v2/dao';
import PromisePool from '@supercharge/promise-pool';

import { Migration } from '..';

@Injectable()
export class DaoCountsMigration implements Migration {
  private readonly logger = new Logger(DaoCountsMigration.name);

  constructor(private readonly daoService: DaoService) {}

  async migrate(): Promise<void> {
    this.logger.log('Starting DAO Counts migration...');

    this.logger.log('Collecting DAOs...');
    const daoIds = await this.daoService.findDaoIds();

    this.logger.log(`Updating DAOs (${daoIds.length}) counts...`);

    await PromisePool.withConcurrency(10)
      .for(daoIds)
      .handleError((err) => {
        throw err;
      })
      .process((id) =>
        this.daoService.save(
          { id },
          {
            updateBountiesCount: true,
            updateNftsCount: true,
            allowDynamo: false,
          },
        ),
      );

    this.logger.log('DAO Counts migration finished.');
  }
}
