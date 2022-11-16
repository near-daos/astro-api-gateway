import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { BountyDynamoService } from '@sputnik-v2/bounty/bounty-dynamo.service';
import { ProposalService } from '@sputnik-v2/proposal';
import { buildProposalId } from '@sputnik-v2/utils';
import { Repository } from 'typeorm';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';
import { UpdateBountyContextDto } from '../../../apps/api/src/bounty/dto/update-bounty-context.dto';

import { BountyContextDto, BountyContextResponse } from './dto';
import { BountyContext } from './entities';

@Injectable()
export class BountyContextService extends TypeOrmCrudService<BountyContext> {
  constructor(
    @InjectRepository(BountyContext)
    private readonly bountyContextRepository: Repository<BountyContext>,
    private readonly proposalService: ProposalService,
    private readonly bountyDynamoService: BountyDynamoService,
  ) {
    super(bountyContextRepository);
  }

  async create(
    bountyContextDto: BountyContextDto,
    proposalId: number,
  ): Promise<string> {
    await this.bountyDynamoService.saveBounty(
      {
        proposalId: bountyContextDto.id,
        daoId: bountyContextDto.daoId,
        transactionHash: bountyContextDto.transactionHash,
        createTimestamp: bountyContextDto.createTimestamp,
      },
      proposalId,
    );
    await this.bountyContextRepository.save(bountyContextDto);

    return bountyContextDto.id;
  }

  async remove(daoId: string, proposalId: number) {
    await this.bountyDynamoService.archive(daoId, proposalId);
    await this.bountyContextRepository.delete({
      id: buildProposalId(daoId, proposalId),
    });
  }

  async createMultiple(
    bountyContextDtos: BountyContextDto[],
  ): Promise<BountyContext[]> {
    await this.bountyDynamoService.saveMultipleBounties(bountyContextDtos);
    return this.bountyContextRepository.save(bountyContextDtos);
  }

  async updateMany({
    daoId,
    ids,
    isArchived,
  }: UpdateBountyContextDto): Promise<UpdateResult> {
    const existingItems = await this.bountyDynamoService.query(daoId, {
      FilterExpression: 'contains(:id, id)',
      ExpressionAttributeValues: {
        ':id': ids,
      },
    });

    const updatedItems = existingItems.map((item) => ({
      ...item,
      isArchived,
    }));

    await this.bountyDynamoService.saveMultiple(updatedItems);

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

  // TODO: dynamo
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

  // TODO: dynamo
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
