import { InjectOpensearchClient, OpensearchClient } from 'nestjs-opensearch';

import { ApiResponse } from '@opensearch-project/opensearch/lib/Transport';
import { Injectable, Logger } from '@nestjs/common';

import { Bounty } from '@sputnik-v2/bounty';
import { Dao } from '@sputnik-v2/dao';
import { Proposal } from '@sputnik-v2/proposal';
import { DraftProposal } from '@sputnik-v2/draft-proposal';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';

import { BaseOpensearchDto } from './dto/base-opensearch.dto';
import { mapProposalToOpensearchDto } from './dto/proposal-opensearch.dto';
import { mapDaoToOpensearchDto } from './dto/dao-opensearch.dto';
import { mapCommentToOpensearchDto } from './dto/comment-opensearch.dto';
import { mapDraftProposalToOpensearchDto } from './dto/draft-proposal-opensearch.dto';
import { Comment } from '../../comment/src/entities';
import { mapBountyToOpensearchDto } from './dto';

@Injectable()
export class OpensearchService {
  private readonly logger = new Logger(OpensearchService.name);

  constructor(
    @InjectOpensearchClient()
    private readonly client: OpensearchClient,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  async indexDao(id: string, dao: Dao): Promise<ApiResponse> {
    if (
      !(await this.featureFlagsService.check(
        FeatureFlags.OpenSearchDaoIndexing,
      ))
    ) {
      return;
    }

    if (!dao) {
      return this.remove(Dao.name, id);
    }

    return this.index(Dao.name, mapDaoToOpensearchDto(dao));
  }

  async indexProposal(
    id: string,
    proposal: Proposal,
  ): Promise<ApiResponse | undefined> {
    if (
      !(await this.featureFlagsService.check(
        FeatureFlags.OpenSearchProposalIndexing,
      ))
    ) {
      return;
    }

    if (!proposal) {
      return this.remove(Proposal.name, id);
    }

    return this.index(Proposal.name, mapProposalToOpensearchDto(proposal));
  }

  async indexComment(id: string, comment: Comment): Promise<ApiResponse> {
    if (!comment) {
      return this.remove(Comment.name, id);
    }

    return this.index(Comment.name, mapCommentToOpensearchDto(comment));
  }

  async indexDraftProposal(
    id: string,
    draftProposal: DraftProposal,
  ): Promise<ApiResponse> {
    if (
      !(await this.featureFlagsService.check(
        FeatureFlags.OpenSearchDraftProposalIndexing,
      ))
    ) {
      return;
    }

    if (!draftProposal) {
      return this.remove(DraftProposal.name, id);
    }

    return this.index(
      DraftProposal.name,
      mapDraftProposalToOpensearchDto(draftProposal),
    );
  }

  async indexBounty(id: string, bounty: Bounty): Promise<ApiResponse> {
    if (
      !(await this.featureFlagsService.check(
        FeatureFlags.OpenSearchBountyIndexing,
      ))
    ) {
      return;
    }

    if (!bounty) {
      return this.remove(Bounty.name, id);
    }

    return this.index(Bounty.name, mapBountyToOpensearchDto(bounty));
  }

  async index(index: string, dto: BaseOpensearchDto): Promise<ApiResponse> {
    const { id, name, description, accounts } = dto;

    let body = null;
    try {
      const res = await this.client.get({
        index: index.toLowerCase(),
        id,
      });

      body = res.body;
    } catch (e) {
      body = { found: false };
    }

    if (body?.found) {
      this.logger.log(`[OpenSearch] Index: ${index} | Updating: ${id}`);

      try {
        const res = this.client.update({
          index: index.toLowerCase(),
          id,
          body: {
            doc: {
              name,
              description,
              accounts,
              ...dto,
            },
          },
        });

        return res;
      } catch (e) {
        this.logger.error(e);
      }
    }

    this.logger.log(`[Opensearch] Index: ${index} | Adding: ${id} |`);

    try {
      const res = await this.client.index({
        index: index.toLowerCase(),
        id,
        body: {
          name,
          description,
          accounts,
          ...dto,
        },
      });

      return res;
    } catch (e) {
      this.logger.error(e);
    }
  }

  async remove(index: string, id: string): Promise<ApiResponse> {
    const { body: exists } = await this.client.exists({ index, id });
    if (!exists) {
      return;
    }

    this.logger.log(`[Opensearch] Index: ${index} | Removing: ${id}`);

    try {
      const res = this.client.delete({
        index: index.toLowerCase(),
        id,
      });

      return res;
    } catch (e) {
      this.logger.error(e);
    }
  }

  async createIndex(index: string, settings?: any): Promise<ApiResponse> {
    this.logger.log(`[Opensearch] Index: ${index} | Creating`);

    const { body: exists } = await this.client.indices.exists({
      index: index.toLowerCase(),
    });

    if (exists) {
      this.logger.log(
        `[Opensearch] Index: ${index} | Creation skipped | Index already exists`,
      );

      return;
    }

    return this.client.indices.create({
      index: index.toLowerCase(),
      body: settings,
    });
  }

  async reIndex(source: string, dest: string): Promise<ApiResponse> {
    this.logger.log(`[Opensearch] Index: ${source} | ReIndexing to ${dest}`);

    return this.client.reindex({
      body: {
        source: { index: source.toLowerCase() },
        dest: { index: dest.toLowerCase() },
      },
      refresh: true,
    });
  }

  async deleteIndexIfExists(index: string): Promise<ApiResponse> {
    this.logger.log(`[Opensearch] Index: ${index} | Removing`);

    const { body: exists } = await this.client.indices.exists({
      index: index.toLowerCase(),
    });

    if (!exists) {
      this.logger.log(
        `[Opensearch] Index: ${index} | Removal skipped | Index missing`,
      );

      return;
    }

    return this.client.indices.delete({ index: index.toLowerCase() });
  }

  async getIndexCount(index: string): Promise<number> {
    const { body } = await this.client.count({ index: index.toLowerCase() });
    return body.count;
  }
}
