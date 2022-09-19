import { FindManyOptions, MongoRepository, Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Dao } from '@sputnik-v2/dao';
import { Proposal } from '@sputnik-v2/proposal';
import { getChunkCount } from '@sputnik-v2/utils';
import { OpensearchService } from '@sputnik-v2/opensearch';
import { Comment } from '@sputnik-v2/comment';
import { DraftProposal } from '@sputnik-v2/draft-proposal';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';

import { Migration } from '..';

@Injectable()
export class OpensearchIndexMigration implements Migration {
  private readonly logger = new Logger(OpensearchIndexMigration.name);

  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,

    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(DraftProposal, DRAFT_DB_CONNECTION)
    private draftProposalRepository: MongoRepository<DraftProposal>,

    private readonly opensearchService: OpensearchService,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Opensearch Index migration...');

    await this.migrateDAOs();

    await this.migrateProposals();

    await this.migrateComments();

    await this.migrateDraftProposals();

    this.logger.log('Finished Opensearch Index migration.');
  }

  private async migrateDAOs() {
    for await (const dao of this.migrateEntity<Dao>(
      Dao.name,
      this.daoRepository,
      { relations: ['delegations'] },
    )) {
      await this.opensearchService.indexDao(dao.id, dao);
    }
  }

  private async migrateProposals() {
    for await (const proposal of this.migrateEntity<Proposal>(
      Proposal.name,
      this.proposalRepository,
      { relations: ['dao'] },
    )) {
      await this.opensearchService.indexProposal(proposal.id, proposal);
    }
  }

  private async migrateComments() {
    for await (const comment of this.migrateEntity<Comment>(
      Comment.name,
      this.commentRepository,
    )) {
      await this.opensearchService.indexComment(`${comment.id}`, comment);
    }
  }

  private async migrateDraftProposals() {
    for await (const draftProposal of this.migrateEntity<DraftProposal>(
      DraftProposal.name,
      this.draftProposalRepository,
    )) {
      await this.opensearchService.indexDraftProposal(
        draftProposal.id,
        draftProposal,
      );
    }
  }

  private async *migrateEntity<
    E extends Dao | Proposal | Comment | DraftProposal,
  >(
    entity: string,
    repo: Repository<E> | MongoRepository<E>,
    findParams?: FindManyOptions<E>,
  ): AsyncGenerator<E> {
    this.logger.log(`Indexing ${entity}...`);

    await this.opensearchService.createIndex(entity);

    const totalCount = await repo.count();

    let count = 0;
    for await (const entities of this.getEntities(repo, findParams)) {
      count += entities.length;

      this.logger.log(`Indexing ${entity}: chunk ${count}/${totalCount}`);

      for (const item of entities) {
        const { id } = item;

        this.logger.log(`Indexing ${entity}: ${id}`);

        yield item;
      }
    }

    this.logger.log(`Indexed ${entity}: ${count}. Finished.`);
  }

  private async *getEntities<E>(
    repo: Repository<E> | MongoRepository<E>,
    findParams?: FindManyOptions<E>,
  ): AsyncGenerator<E[]> {
    const chunkSize = 50;
    const count = await repo.count();
    const chunkCount = getChunkCount(BigInt(count), chunkSize);

    for (let i = 0; i < chunkCount; i++) {
      const chunk = await repo.find({
        take: chunkSize,
        skip: chunkSize * i,
        loadEagerRelations: false,
        ...findParams,
      });

      yield chunk;
    }
  }
}
