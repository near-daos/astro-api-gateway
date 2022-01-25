import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { Connection, In, Not, Repository } from 'typeorm';
import {
  Proposal,
  ProposalService,
  ProposalStatus,
  ProposalVoteStatus,
} from '@sputnik-v2/proposal';
import { calculateFunds, getBlockTimestamp, paginate } from '@sputnik-v2/utils';
import { TokenService } from '@sputnik-v2/token';
import { DaoStatus, DaoVariant } from '@sputnik-v2/dao/types';

import { DaoDto, DaoMemberVote, DaoResponse } from './dto';
import { Dao, RoleKindType } from './entities';
import { WeightKind } from '@sputnik-v2/sputnikdao';

@Injectable()
export class DaoService extends TypeOrmCrudService<Dao> {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    @InjectConnection()
    private connection: Connection,
    private readonly proposalService: ProposalService,
    private readonly tokenService: TokenService,
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
    return this.daoRepository.save(daoDto);
  }

  async search(req: CrudRequest, query: string): Promise<Dao[] | DaoResponse> {
    const likeQuery = `%${query.toLowerCase()}%`;
    const { limit, offset, fields } = req.parsed;
    const [data, total] = await this.daoRepository
      .createQueryBuilder('dao')
      .select(fields.map((field) => `dao.${field}`))
      .where(`lower(dao.id) like :likeQuery`, { likeQuery })
      .orWhere(`lower(dao.config) like :likeQuery`, { likeQuery })
      .orWhere(`lower(dao.metadata) like :likeQuery`, { likeQuery })
      .orWhere(`lower(dao.description) like :likeQuery`, { likeQuery })
      .orWhere(`array_to_string(dao.accountIds, '||') like :likeQuery`, {
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
      .limit(limit)
      .getManyAndCount();
    return paginate<Dao>(data, limit, offset, total);
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
}
