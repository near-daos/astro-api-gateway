import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { ProposalService } from '@sputnik-v2/proposal';
import {
  BountyModel,
  DynamodbService,
  DynamoEntityType,
} from '@sputnik-v2/dynamodb';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';
import { buildProposalId } from '@sputnik-v2/utils';

import { BountyContextDto, BountyContextResponse } from './dto';
import { BountyContext } from './entities';
import { UpdateBountyContextDto } from '../../../apps/api/src/bounty/dto/update-bounty-context.dto';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';

@Injectable()
export class BountyContextService extends TypeOrmCrudService<BountyContext> {
  constructor(
    @InjectRepository(BountyContext)
    private readonly bountyContextRepository: Repository<BountyContext>,
    private readonly proposalService: ProposalService,
    private readonly dynamodbService: DynamodbService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {
    super(bountyContextRepository);
  }

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.ProposalDynamo);
  }

  async create(
    bountyContextDto: BountyContextDto,
    proposalId: number,
  ): Promise<string> {
    if (await this.useDynamoDB()) {
      await this.dynamodbService.saveBounty(
        {
          proposalId: bountyContextDto.id,
          daoId: bountyContextDto.daoId,
          transactionHash: bountyContextDto.transactionHash,
          createTimestamp: bountyContextDto.createTimestamp,
        },
        proposalId,
      );
    } else {
      await this.bountyContextRepository.save(bountyContextDto);
    }

    return bountyContextDto.id;
  }

  async remove(daoId: string, proposalId: number) {
    if (await this.useDynamoDB()) {
      await this.dynamodbService.saveItem<BountyModel>({
        partitionId: daoId,
        entityId: `${DynamoEntityType.Bounty}:${proposalId}`,
        isArchived: true,
      });
    } else {
      await this.bountyContextRepository.delete({
        id: buildProposalId(daoId, proposalId),
      });
    }
  }

  async createMultiple(
    bountyContextDtos: BountyContextDto[],
  ): Promise<BountyContext[]> {
    return this.bountyContextRepository.save(bountyContextDtos);
  }

  async updateMany({
    daoId,
    ids,
    isArchived,
  }: UpdateBountyContextDto): Promise<UpdateResult> {
    return this.bountyContextRepository
      .createQueryBuilder()
      .update(BountyContext)
      .where('daoId = :daoId', {
        daoId,
      })
      .andWhere('id IN (:...ids) ', { ids })
      .set({ isArchived })
      .execute();
  }

  async updateCommentsCount(
    id: string,
    commentsCount: number,
  ): Promise<UpdateResult> {
    return this.bountyContextRepository
      .createQueryBuilder()
      .update(BountyContext)
      .where('id = :id', {
        id,
      })
      .set({ commentsCount })
      .execute();
  }

  async getMany(
    req: CrudRequest,
    permissionsAccountId?: string,
  ): Promise<BountyContext[] | BountyContextResponse> {
    const bountyContextResponse = await super.getMany(req);
    return this.setProposalsPermissions(
      bountyContextResponse,
      permissionsAccountId,
    );
  }

  private async setProposalsPermissions(
    bountyContextResponse: BountyContext[] | BountyContextResponse,
    permissionsAccountId?: string,
  ): Promise<BountyContext[] | BountyContextResponse> {
    const bountyContexts =
      bountyContextResponse instanceof Array
        ? bountyContextResponse
        : bountyContextResponse.data;

    if (!bountyContexts.length) {
      return bountyContextResponse;
    }

    const proposals = bountyContexts.reduce((proposals, bountyContext) => {
      if (bountyContext.proposal) {
        proposals.push(bountyContext.proposal);
      }

      if (bountyContext.bounty?.bountyDoneProposals) {
        proposals = proposals.concat(bountyContext.bounty?.bountyDoneProposals);
      }

      return proposals;
    }, []);
    const proposalsFeed = await this.proposalService.mapProposalFeed(
      proposals,
      permissionsAccountId,
    );

    proposals.forEach((proposal, i) => {
      proposal.permissions = proposalsFeed[i].permissions;
    });

    return bountyContextResponse;
  }
}
