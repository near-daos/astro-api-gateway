import { Injectable, Logger } from '@nestjs/common';

import { Dao } from '@sputnik-v2/dao';
import { OpensearchService } from '@sputnik-v2/opensearch';
import { DaoOpensearchDto } from '@sputnik-v2/opensearch/dto';

import { Migration } from '..';

@Injectable()
export class OpensearchIndexMappingMigration implements Migration {
  private readonly logger = new Logger(OpensearchIndexMappingMigration.name);

  constructor(private readonly opensearchService: OpensearchService) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Opensearch Index Mapping migration...');

    await this.migrateIndexMapping(
      Dao.name,
      `astro_${Dao.name}`,
      DaoOpensearchDto.getMappings(),
    );

    // TODO: propagate to each Opensearch index in question

    this.logger.log('Finished Opensearch Index Mapping migration.');
  }

  private async migrateIndexMapping(
    source: string,
    dest: string,
    mappings: any,
  ) {
    await this.opensearchService.createIndex(dest, mappings);

    await this.opensearchService.reIndex(source, dest);
  }
}
