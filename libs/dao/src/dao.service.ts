import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { Repository } from 'typeorm';
import {
  ProposalService,
  ProposalVoteStatus,
  ProposalStatus,
  Proposal,
} from '@sputnik-v2/proposal';

import { DaoDto, DaoResponse, DaoFeed, DaoFeedResponse } from './dto';
import { Dao } from './entities';

@Injectable()
export class DaoService extends TypeOrmCrudService<Dao> {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    private readonly proposalService: ProposalService,
  ) {
    super(daoRepository);
  }

  async findAccountDaos(accountId: string): Promise<Dao[] | DaoResponse> {
    return await this.daoRepository
      .createQueryBuilder('dao')
      .leftJoinAndSelect('dao.policy', 'policy')
      .leftJoinAndSelect('policy.roles', 'roles')
      .andWhere(`:accountId = ANY(roles.accountIds)`, {
        accountId,
      })
      .orderBy('dao.createTimestamp', 'DESC')
      .getMany();
  }

  async create(daoDto: DaoDto): Promise<Dao> {
    return this.daoRepository.save(daoDto);
  }

  async search(req: CrudRequest, query: string): Promise<Dao[] | DaoResponse> {
    req.options.query.join = {
      policy: {
        eager: true,
      },
      'policy.roles': {
        eager: true,
      },
    };

    req.parsed.search = {
      $and: [
        {},
        {
          $or: [
            {
              id: { $contL: query },
            },
            {
              description: { $contL: query },
            },
            {
              config: { $contL: query },
            },
            {
              'policy.roles.accountIds': { $in: [`{${query}}`] },
            },
          ],
        },
      ],
    };

    return this.getMany(req);
  }

  async getFeed(req: CrudRequest): Promise<DaoFeed[] | DaoFeedResponse> {
    const daoFeedResponse = await super.getMany(req);

    const daos =
      daoFeedResponse instanceof Array ? daoFeedResponse : daoFeedResponse.data;

    if (!daos || !daos.length) {
      return daoFeedResponse as DaoFeedResponse;
    }

    const daoIds: string[] = daos.map(({ id }) => id);

    // TODO: accelerate querying
    const proposals = await this.proposalService.findProposalsByDaoIds(daoIds);

    const proposalsByDao = proposals?.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.daoId]: [...(acc[cur.daoId] || []), cur],
      }),
      {},
    );

    const daoFeed: DaoFeed[] = daos.map((dao) =>
      this.buildFeedFromDao(dao, proposalsByDao?.[dao.id]),
    );

    if (daoFeedResponse instanceof Array) {
      return daoFeed;
    }

    return {
      ...daoFeedResponse,
      data: daoFeed,
    };
  }

  async getDaoFeed(id: string): Promise<DaoFeed> {
    const dao: Dao = await this.findOne(id);

    const proposals = await this.proposalService.findProposalsByDaoIds([id]);

    return this.buildFeedFromDao(dao, proposals);
  }

  private buildFeedFromDao(dao: Dao, proposals: Proposal[]): DaoFeed {
    return {
      ...dao,
      activeProposalCount: proposals?.filter((proposal) =>
        this.isProposalActive(proposal),
      ).length,
      totalProposalCount: proposals?.length,
    };
  }

  private isProposalActive(proposal: Proposal): boolean {
    const { voteStatus, status } = proposal;

    return (
      status === ProposalStatus.InProgress &&
      voteStatus !== ProposalVoteStatus.Expired
    );
  }
}
