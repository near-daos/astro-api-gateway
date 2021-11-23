import { Injectable, Logger } from '@nestjs/common';
import { Dao } from '@sputnik-v2/dao';

import { Migration } from '..';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DaoMetadataMigration implements Migration {
  private readonly logger = new Logger(DaoMetadataMigration.name);

  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting DAO Metadata migration...');

    this.logger.log('Collecting daos...');
    const daos = await this.daoRepository.find();

    this.logger.log('Decoding DAOs metadata...');
    await this.daoRepository.save(
      daos.map((dao) => ({
        ...dao,
        metadata: dao.config?.metadata
          ? Buffer.from(dao.config.metadata, 'base64').toString('utf-8')
          : '',
      })),
    );
  }
}
