import { Injectable, Logger } from '@nestjs/common';

import { Dao } from '@sputnik-v2/dao';
import { OpensearchService } from '@sputnik-v2/opensearch';
import {
  DaoOpensearchDto,
  ProposalOpensearchDto,
  BountyOpensearchDto,
  DraftProposalOpensearchDto,
  TokenPriceOpensearchDto,
} from '@sputnik-v2/opensearch/dto';
import { Proposal } from '@sputnik-v2/proposal';
import { Bounty } from '@sputnik-v2/bounty';
import { sleep } from '@sputnik-v2/utils';
import { DraftProposal } from '@sputnik-v2/draft-proposal';

import { Migration } from '..';

@Injectable()
export class OpensearchIndexMappingMigration implements Migration {
  private readonly logger = new Logger(OpensearchIndexMappingMigration.name);

  constructor(private readonly opensearchService: OpensearchService) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Opensearch Index Mapping migration...');

    this.logger.log('DAO Index Mapping migration...');
    await this.migrateIndexMapping(
      Dao.name,
      `astro_${Dao.name}`,
      DaoOpensearchDto.getMappings(),
    );

    this.logger.log('Proposal Index Mapping migration...');
    await this.migrateIndexMapping(
      Proposal.name,
      `astro_${Proposal.name}`,
      ProposalOpensearchDto.getMappings(),
    );

    this.logger.log('Bounty Index Mapping migration...');
    await this.migrateIndexMapping(
      Bounty.name,
      `astro_${Bounty.name}`,
      BountyOpensearchDto.getMappings(),
    );

    this.logger.log('Draft Proposal Index Mapping migration...');
    await this.migrateIndexMapping(
      DraftProposal.name,
      `astro_${DraftProposal.name}`,
      DraftProposalOpensearchDto.getMappings(),
    );

    this.logger.log('Token Price Index Mapping migration...');
    await this.migrateIndexMapping(
      'TokenPrice',
      `astro_TokenPrice`,
      TokenPriceOpensearchDto.getMappings(),
    );

    this.logger.log('Finished Opensearch Index Mapping migration.');
  }

  private async migrateIndexMapping(
    source: string,
    dest: string,
    mappings: any,
  ) {
    this.logger.log(`Creating ${dest} index`);
    await this.opensearchService.createIndex(dest, mappings);

    this.logger.log(`Waiting for ${dest} re-index...`);
    await this.opensearchService.reIndex(source, dest);
    await this.waitOnReIndex(source, dest);

    this.logger.log(`Deleting ${source} index`);
    await this.opensearchService.deleteIndexIfExists(source);

    this.logger.log(`Creating ${source} index`);
    await this.opensearchService.createIndex(source, mappings);

    this.logger.log(`Waiting for ${source} re-index...`);
    await this.opensearchService.reIndex(dest, source);
    await this.waitOnReIndex(dest, source);

    this.logger.log(`Deleting ${dest} index`);
    await this.opensearchService.deleteIndexIfExists(dest);
  }

  private async waitOnReIndex(source: string, dest: string) {
    let sourceCount = await this.opensearchService.getIndexCount(source);
    let destCount = await this.opensearchService.getIndexCount(dest);

    while (destCount !== destCount) {
      this.logger.log(
        `${source} index count: ${sourceCount} / ${dest} index count: ${destCount}`,
      );

      await sleep(5000);

      sourceCount = await this.opensearchService.getIndexCount(source);
      destCount = await this.opensearchService.getIndexCount(dest);
    }
  }
}
