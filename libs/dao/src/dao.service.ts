import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { Connection, In, Not, Repository } from 'typeorm';
import {
  Action,
  Proposal,
  ProposalService,
  ProposalStatus,
  ProposalVoteStatus,
} from '@sputnik-v2/proposal';
import { calculateFunds, getBlockTimestamp, paginate } from '@sputnik-v2/utils';
import { TokenService } from '@sputnik-v2/token';
import { DaoStatus, DaoVariant } from '@sputnik-v2/dao/types';

import {
  DaoDto,
  DaoMemberVote,
  DaoResponse,
  SearchMemberDto,
  SearchMemberResponse,
} from './dto';
import { Dao, DaoVersion, RoleKindType } from './entities';
import { WeightKind } from '@sputnik-v2/sputnikdao';
import { SearchQuery } from '@sputnik-v2/common';
import { NearApiService } from '@sputnik-v2/near-api';

@Injectable()
export class DaoService extends TypeOrmCrudService<Dao> {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    @InjectRepository(DaoVersion)
    private readonly daoVersionRepository: Repository<DaoVersion>,
    @InjectConnection()
    private connection: Connection,
    private readonly proposalService: ProposalService,
    private readonly tokenService: TokenService,
    private readonly nearApiService: NearApiService,
  ) {
    super(daoRepository);
  }

  async findAccountDaos(
    accountId: string,
    fields: string[],
  ): Promise<Dao[] | DaoResponse> {
    return await this.daoRepository
      .createQueryBuilder('dao')
      .select(fields.map((field) => `dao.${field}`))
      .andWhere(`:accountId = ANY(dao.accountIds)`, {
        accountId,
      })
      .andWhere('dao.status != :status', { status: DaoStatus.Disabled })
      .orderBy('dao.createTimestamp', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<Dao> {
    return this.daoRepository.findOne({ id, status: Not(DaoStatus.Disabled) });
  }

  async findByIds(daoIds?: string[]): Promise<Dao[]> {
    return daoIds
      ? await this.daoRepository.find({ id: In(daoIds) })
      : await this.daoRepository.find();
  }

  async findDaoIds(): Promise<string[]> {
    const daos = await this.daoRepository
      .createQueryBuilder('dao')
      .select(['dao.id'])
      .getMany();
    return daos.map(({ id }) => id);
  }

  async create(daoDto: Partial<DaoDto>): Promise<Dao> {
    await this.daoRepository.save(daoDto);
    const dao = await this.daoRepository.findOne(daoDto.id);

    if (!dao.daoVersionHash) {
      await this.setDaoVersion(dao.id);
    }

    return dao;
  }

  async search(
    req: CrudRequest,
    params: SearchQuery,
  ): Promise<Dao[] | DaoResponse> {
    const likeQuery = `%${params.query.toLowerCase()}%`;
    const { limit, offset, fields } = req.parsed;
    const [data, total] = await this.daoRepository
      .createQueryBuilder('dao')
      .select([
        ...fields.map((field) => `dao.${field}`),
        'policy.daoId',
        'roles.name',
        'roles.accountIds',
      ])
      .leftJoin('dao.policy', 'policy')
      .leftJoin('policy.roles', 'roles')
      .where(`dao.id ilike :likeQuery`, { likeQuery })
      .orWhere(`dao.config ->> 'purpose' ilike :likeQuery`, { likeQuery })
      .orWhere(`dao.metadata ->> 'displayName' ilike :likeQuery`, { likeQuery })
      .orWhere(`dao.description ilike :likeQuery`, { likeQuery })
      .orWhere(`array_to_string(dao.accountIds, '||') ilike :likeQuery`, {
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
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    return paginate<Dao>(data, limit, offset, total);
  }

  async searchMember(
    req: CrudRequest,
    params: SearchQuery,
  ): Promise<SearchMemberResponse> {
    const likeQuery = `%${params.query.toLowerCase()}%`;
    const { limit, offset } = req.parsed;
    const query = await this.connection
      .createQueryBuilder()
      .select('account_id', 'accountId')
      .addSelect(
        `json_agg(json_build_object('daoId', dao_id, 'name', name, 'kind', kind, 'permissions', permissions))`,
        'roles',
      )
      .addSelect((qb) => {
        return qb
          .subQuery()
          .select('count(1)')
          .from('proposal_action', 'pa')
          .where('pa.account_id = r.account_id')
          .andWhere('pa.action in (:...actions)', {
            actions: [Action.VoteApprove, Action.VoteReject, Action.VoteRemove],
          });
      }, 'voteCount')
      .from((qb) => {
        return qb
          .subQuery()
          .select([
            'policy_dao_id as dao_id',
            'unnest(account_ids) as account_id',
            'name',
            'kind',
            'permissions',
          ])
          .from('role', 'role');
      }, 'r')
      .where('account_id ilike :likeQuery', { likeQuery })
      .groupBy('account_id');
    const [data, total] = await Promise.all([
      query
        .clone()
        .orderBy('account_id', 'ASC')
        .limit(limit)
        .offset(offset)
        .getRawMany(),
      query.clone().select('count(1) as count').getRawOne(),
    ]);
    return paginate<SearchMemberDto>(
      data.map(({ voteCount, ...rest }) => ({
        ...rest,
        voteCount: parseInt(voteCount),
      })),
      limit,
      offset,
      parseInt(total?.count || 0),
    );
  }

  async getDaoMembers(daoId: string): Promise<string[]> {
    const dao = await this.daoRepository.findOne(daoId);
    const allMembers = dao?.policy?.roles.reduce((members, role) => {
      return members.concat(role.accountIds);
    }, []);
    return [...new Set(allMembers)].filter((accountId) => accountId);
  }

  public async getCouncil(daoId: string): Promise<string[]> {
    const dao = await this.daoRepository.findOne(daoId);
    const councilRole = dao.policy.roles.find(
      ({ name, kind }) =>
        String(name).toLowerCase() === 'council' && kind === RoleKindType.Group,
    );
    return councilRole?.accountIds || [];
  }

  public getDaoVariant(dao: DaoDto): DaoVariant {
    const canEveryoneAddProposal = dao.policy.roles.some(
      (role) =>
        role.kind === RoleKindType.Everyone &&
        role.permissions.includes('*:AddProposal'),
    );
    const hasTokensVotingPower = dao.policy.roles.some(
      (role) => role.votePolicy?.['*.*']?.weightKind === WeightKind.TokenWeight,
    );
    const hasCouncil = dao.policy.roles.some((role) => role.name === 'Council');

    if (!canEveryoneAddProposal && !hasTokensVotingPower && !hasCouncil) {
      return DaoVariant.Club;
    }

    if (canEveryoneAddProposal && !hasTokensVotingPower && hasCouncil) {
      return DaoVariant.Foundation;
    }

    if (!canEveryoneAddProposal && hasTokensVotingPower && hasCouncil) {
      return DaoVariant.Corporation;
    }

    if (!canEveryoneAddProposal && !hasTokensVotingPower && hasCouncil) {
      return DaoVariant.Cooperative;
    }

    return DaoVariant.Custom;
  }

  public async saveWithProposalCount(dao: Partial<DaoDto>) {
    return this.daoRepository.save({
      ...dao,
      totalProposalCount: await this.proposalService.getDaoProposalCount(
        dao.id,
      ),
      activeProposalCount: await this.proposalService.getDaoActiveProposalCount(
        dao.id,
      ),
    });
  }

  public async saveWithFunds(dao: Partial<DaoDto>) {
    return this.daoRepository.save({
      ...dao,
      totalDaoFunds: await this.calculateDaoFunds(dao.id, dao.amount),
    });
  }

  public async saveWithAdditionalFields(dao: Partial<DaoDto>) {
    return this.daoRepository.save({
      ...dao,
      totalProposalCount: await this.proposalService.getDaoProposalCount(
        dao.id,
      ),
      activeProposalCount: await this.proposalService.getDaoActiveProposalCount(
        dao.id,
      ),
      totalDaoFunds: await this.calculateDaoFunds(dao.id, dao.amount),
    });
  }

  public async updateDaoStatus(dao: Dao): Promise<Dao> {
    const status = await this.getDaoStatus(dao);

    if (dao.status !== status) {
      return this.daoRepository.save({
        ...dao,
        status,
      });
    }

    return dao;
  }

  public async getDaoStatus(dao: Dao): Promise<DaoStatus> {
    if (dao.status === DaoStatus.Disabled) {
      return DaoStatus.Disabled;
    }

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const activeProposalCount = await this.connection
      .createQueryBuilder()
      .select()
      .from(Proposal, 'proposal')
      .where('proposal.daoId = :daoId', { daoId: dao.id })
      .andWhere(
        '((proposal.voteStatus = :voteStatus AND proposal.status = :status) OR proposal.createTimestamp > :timestamp)',
        {
          voteStatus: ProposalVoteStatus.Active,
          status: ProposalStatus.InProgress,
          timestamp: getBlockTimestamp(oneDayAgo),
        },
      )
      .getCount();

    return activeProposalCount > 0 ? DaoStatus.Active : DaoStatus.Inactive;
  }

  public async calculateDaoFunds(
    daoId: string,
    nearAmount: number,
  ): Promise<number> {
    const tokenBalances = await this.tokenService.tokenBalancesByAccount(daoId);
    const nearToken = await this.tokenService.getNearToken();
    const nearBalance = nearAmount
      ? calculateFunds(nearAmount, nearToken.price, nearToken.decimals)
      : 0;
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

  public async getDaoMemberVotes(daoId: string): Promise<DaoMemberVote[]> {
    const daoMembers = await this.getDaoMembers(daoId);
    const proposalVoters = await this.proposalService.findDaoVoters(daoId);
    return daoMembers.map((accountId) => ({
      accountId,
      voteCount: proposalVoters.filter(({ votes }) => !!votes[accountId])
        .length,
    }));
  }

  async loadDaoVersions(): Promise<DaoVersion[]> {
    const sputnikDaoFactory =
      this.nearApiService.getContract('sputnikDaoFactory');
    const daoVersions = await sputnikDaoFactory.get_contracts_metadata();
    return this.daoVersionRepository.save(
      daoVersions.map(([hash, { version, commit_id, changelog_url }]) => ({
        hash,
        version,
        commitId: commit_id,
        changelogUrl: changelog_url,
      })),
    );
  }

  async getDaoVersionById(id: string): Promise<DaoVersion> {
    const versions = await this.daoVersionRepository.find();
    const daoVersionHash = await this.nearApiService.getContractVersionHash(id);
    return versions.find(({ hash }) => daoVersionHash === hash);
  }

  async setDaoVersion(id: string): Promise<void> {
    await this.daoRepository.save({
      id,
      daoVersion: await this.getDaoVersionById(id),
    });
  }
}
