import { Injectable, NotFoundException } from '@nestjs/common';
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
import { calculateFunds, paginate } from '@sputnik-v2/utils';
import { TokenBalance, TokenService } from '@sputnik-v2/token';

import { DaoDto, DaoResponse, DaoFeed, DaoFeedResponse } from './dto';
import { Dao } from './entities';

@Injectable()
export class DaoService extends TypeOrmCrudService<Dao> {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    private readonly proposalService: ProposalService,
    private readonly tokenService: TokenService,
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

  async search(
    req: CrudRequest,
    query: string,
  ): Promise<DaoFeed[] | DaoFeedResponse> {
    const likeQuery = `%${query.toLowerCase()}%`;
    const daos = await this.daoRepository
      .createQueryBuilder('dao')
      .leftJoinAndSelect('dao.policy', 'policy')
      .leftJoinAndSelect('policy.roles', 'roles')
      .where(`lower(dao.id) like :likeQuery`, { likeQuery })
      .orWhere(`lower(dao.config) like :likeQuery`, { likeQuery })
      .orWhere(`lower(dao.metadata) like :likeQuery`, { likeQuery })
      .orWhere(`lower(dao.description) like :likeQuery`, { likeQuery })
      .orWhere(`array_to_string(roles.accountIds, '||') like :likeQuery`, {
        likeQuery,
      })
      .orderBy(
        req.parsed?.sort?.reduce(
          (options, option) => ({
            ...options,
            [`dao.${option.field}`]: option.order,
          }),
          {},
        ),
      )
      .getMany();

    const daoFeed: DaoFeed[] = await this.getDaosFeed(daos);

    return paginate<DaoFeed>(daoFeed, req.parsed.limit, req.parsed.offset);
  }

  async getFeed(req: CrudRequest): Promise<DaoFeed[] | DaoFeedResponse> {
    const daoFeedResponse = await super.getMany(req);

    const daos =
      daoFeedResponse instanceof Array ? daoFeedResponse : daoFeedResponse.data;

    if (!daos || !daos.length) {
      return daoFeedResponse as DaoFeedResponse;
    }

    const daoFeed: DaoFeed[] = await this.getDaosFeed(daos);

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

    if (!dao) {
      throw new NotFoundException(`DAO with id ${id} not found`);
    }

    const proposals = await this.proposalService.findProposalsByDaoIds([id]);
    const tokenBalances = await this.tokenService.findTokenBalancesByDaoIds([
      id,
    ]);
    const nearToken = await this.tokenService.getNearToken();

    return this.buildFeedFromDao(dao, proposals, tokenBalances, nearToken);
  }

  async getDaosFeed(daos: Dao[]): Promise<DaoFeed[]> {
    if (daos.length === 0) {
      return [];
    }

    const daoIds: string[] = daos.map(({ id }) => id);
    const proposals = await this.proposalService.findProposalsByDaoIds(daoIds);
    const tokenBalances = await this.tokenService.findTokenBalancesByDaoIds(
      daoIds,
    );

    const proposalsByDao = proposals?.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.daoId]: [...(acc[cur.daoId] || []), cur],
      }),
      {},
    );
    const nearToken = await this.tokenService.getNearToken();
    const tokenBalancesByDao = tokenBalances?.reduce(
      (balances, token) => ({
        ...balances,
        [token.accountId]: [...(balances[token.accountId] || []), token],
      }),
      {},
    );

    return daos.map((dao) =>
      this.buildFeedFromDao(
        dao,
        proposalsByDao?.[dao.id],
        tokenBalancesByDao?.[dao.id],
        nearToken,
      ),
    );
  }

  private buildFeedFromDao(
    dao: Dao,
    proposals: Proposal[],
    tokenBalances: TokenBalance[],
    nearToken,
  ): DaoFeed {
    return {
      ...dao,
      activeProposalCount: proposals?.filter((proposal) =>
        this.isProposalActive(proposal),
      ).length,
      totalProposalCount: proposals?.length,
      totalDaoFunds: this.calculateDaoFunds(
        dao,
        tokenBalances,
        nearToken,
      ).toFixed(2),
    };
  }

  private isProposalActive(proposal: Proposal): boolean {
    const { voteStatus, status } = proposal;

    return (
      status === ProposalStatus.InProgress &&
      voteStatus !== ProposalVoteStatus.Expired
    );
  }

  private calculateDaoFunds(
    dao: Dao,
    tokenBalances: TokenBalance[] = [],
    nearToken,
  ): number {
    const nearBalance = calculateFunds(
      dao.amount,
      nearToken.price,
      nearToken.decimals,
    );
    const tokenBalance = tokenBalances.reduce((balance, tokenBalance) => {
      if (
        tokenBalance.balance &&
        tokenBalance.token?.price &&
        tokenBalance.token.decimals
      ) {
        return (
          balance +
          calculateFunds(
            tokenBalance.balance,
            tokenBalance.token.price,
            tokenBalance.token.decimals,
          )
        );
      }
      return balance;
    }, 0);

    return Number(nearBalance) + Number(tokenBalance);
  }
}
