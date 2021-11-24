import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dao } from '@sputnik-v2/dao';
import { decodeBase64 } from '@sputnik-v2/utils';

import { Migration } from '..';

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
        metadata: dao.config?.metadata ? decodeBase64(dao.config.metadata) : '',
      })),
    );
  }
}
