import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { ProposalService } from '@sputnik-v2/proposal';

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
  ) {
    super(bountyContextRepository);
  }

  async create(bountyContextDto: BountyContextDto): Promise<BountyContext> {
    return this.bountyContextRepository.save(bountyContextDto);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.bountyContextRepository.delete({ id });
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
