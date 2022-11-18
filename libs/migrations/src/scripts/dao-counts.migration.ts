import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BountyService } from '@sputnik-v2/bounty';
import { Dao } from '@sputnik-v2/dao';
import { NFTTokenService } from '@sputnik-v2/token';
import { Repository } from 'typeorm';

import { Migration } from '..';

@Injectable()
export class DaoCountsMigration implements Migration {
  private readonly logger = new Logger(DaoCountsMigration.name);

  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    private readonly bountyService: BountyService,
    private readonly nftTokenService: NFTTokenService,
  ) {}

  async migrate(): Promise<void> {
    this.logger.log('Starting DAO Counts migration...');

    this.logger.log('Collecting DAOs...');
    const daos = await this.daoRepository.find();

    this.logger.log(`Updating DAOs counts...`);

    const entities = await Promise.all(
      daos.map(async (dao) => {
        const [bountyCount, nftCount] = await Promise.all([
          this.bountyService.getDaoActiveBountiesCount(dao.id, false),
          this.nftTokenService.getAccountTokenCount(dao.id, false),
        ]);
        return {
          ...dao,
          bountyCount,
          nftCount,
        };
      }),
    );

    await this.daoRepository.save(entities);

    this.logger.log(' DAO Counts migration finished.');
  }
}
