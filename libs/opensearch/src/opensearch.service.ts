import { InjectOpensearchClient, OpensearchClient } from 'nestjs-opensearch';

import { ApiResponse } from '@opensearch-project/opensearch/lib/Transport';
import { Injectable, Logger } from '@nestjs/common';

import { Dao } from '@sputnik-v2/dao';
import { Proposal } from '@sputnik-v2/proposal';
import { DraftProposal } from '@sputnik-v2/draft-proposal';

import { BaseOpensearchDto } from './dto/base-opensearch.dto';
import { mapProposalToOpensearchDto } from './dto/proposal-opensearch.dto';
import { mapDaoToOpensearchDto } from './dto/dao-opensearch.dto';
import { mapCommentToOpensearchDto } from './dto/comment-opensearch.dto';
import { mapDraftProposalToOpensearchDto } from './dto/draft-proposal-opensearch.dto';
import { Comment } from '../../comment/src/entities';

@Injectable()
export class OpensearchService {
  private readonly logger = new Logger(OpensearchService.name);

  constructor(
    @InjectOpensearchClient()
    private readonly client: OpensearchClient,
  ) {}

  async indexDao(id: string, dao: Dao): Promise<ApiResponse> {
    if (!dao) {
      return this.remove(Dao.name, id);
    }

    return this.index(Dao.name, mapDaoToOpensearchDto(dao));
  }

  async indexProposal(id: string, proposal: Proposal): Promise<ApiResponse> {
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
    if (!draftProposal) {
      return this.remove(DraftProposal.name, id);
    }

    return this.index(
      DraftProposal.name,
      mapDraftProposalToOpensearchDto(draftProposal),
    );
  }

  async index(index: string, dto: BaseOpensearchDto): Promise<ApiResponse> {
    const { id, name, description, accounts } = dto;

    let body = null;
    try {
      let res = await this.client.get({
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
        return this.client.update({
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
      } catch (e) {
        this.logger.error(e);
      }
    }

    this.logger.log(`[Opensearch] Index: ${index} | Adding: ${id} |`);

    try {
      return this.client.index({
        index: index.toLowerCase(),
        id,
        body: {
          name,
          description,
          accounts,
          ...dto,
        },
      });
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
      return this.client.delete({
        index: index.toLowerCase(),
        id,
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  async createIndex(index: string): Promise<ApiResponse> {
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

    return this.client.indices.create({ index: index.toLowerCase() });
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
}
