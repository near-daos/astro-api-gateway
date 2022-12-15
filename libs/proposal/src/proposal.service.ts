import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { CrudRequest } from '@nestjsx/crud';
import {
  Brackets,
  Connection,
  DeleteResult,
  FindConditions,
  In,
  Not,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { Dao, Delegation, Role, RoleKindType } from '@sputnik-v2/dao/entities';
import { Order, SearchQuery } from '@sputnik-v2/common';
import {
  buildDelegationId,
  buildProposalId,
  getAccountPermissions,
  getBlockTimestamp,
} from '@sputnik-v2/utils';
import { BaseTypeOrmCrudService } from '@sputnik-v2/common/services/type-orm-crud.service';

import {
  AccountProposalQuery,
  ProposalDto,
  ProposalQuery,
  ProposalResponse,
  ProposalsRequest,
  ProposalsResponse,
} from './dto';
import { Proposal } from './entities';
import { ProposalStatus, ProposalVoteStatus } from './types';
import { PartialEntity, ProposalModel } from '@sputnik-v2/dynamodb';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';
import { ProposalDynamoService } from './proposal-dynamo.service';

@Injectable()
export class ProposalService extends BaseTypeOrmCrudService<Proposal> {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Delegation)
    private readonly delegationRepository: Repository<Delegation>,
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    @InjectConnection()
    private connection: Connection,
    private readonly proposalDynamoService: ProposalDynamoService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {
    super(proposalRepository);
  }

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.ProposalDynamo);
  }

  async findById(
    daoId: string,
    proposalId: number,
  ): Promise<Proposal | PartialEntity<ProposalModel>> {
    if (await this.useDynamoDB()) {
      return this.proposalDynamoService.get(daoId, String(proposalId));
    } else {
      return this.proposalRepository.findOne(
        buildProposalId(daoId, proposalId),
      );
    }
  }

  async create(proposalDto: ProposalDto): Promise<void> {
    await this.proposalDynamoService.saveProposalDto(proposalDto);
    await this.proposalRepository.save({
      ...proposalDto,
      kind: proposalDto.kind.kind,
    });
  }

  createMultiple(proposalDtos: ProposalDto[]): Promise<Proposal[]> {
    return this.proposalRepository.save(
      proposalDtos.map((proposalDto) => {
        return {
          ...proposalDto,
          kind: proposalDto.kind.kind,
        };
      }),
    );
  }

  update(proposal: Partial<Proposal>): Promise<Proposal> {
    return this.proposalRepository.save(proposal);
  }

  updateMultiple(proposal: Partial<Proposal>[]): Promise<Proposal[]> {
    return this.proposalRepository.save(proposal);
  }

  async updateCommentsCount(
    id: string,
    commentsCount: number,
  ): Promise<UpdateResult> {
    return this.proposalRepository
      .createQueryBuilder()
      .update(Proposal)
      .where('id = :id', {
        id,
      })
      .set({ commentsCount })
      .execute();
  }

  async getById(
    proposalId: string,
    permissionsAccountId?: string,
  ): Promise<Proposal> {
    const proposal: Proposal = await this.findOne(proposalId);

    if (!proposal) {
      throw new BadRequestException('Invalid Proposal ID');
    }

    const accountDelegation = await this.delegationRepository.findOne(
      buildDelegationId(proposal.daoId, permissionsAccountId),
    );

    return this.populateProposalPermissions(
      proposal,
      proposal.dao.policy.roles,
      permissionsAccountId,
      accountDelegation?.balance,
    );
  }

  async getFeed(params: ProposalsRequest): Promise<ProposalsResponse> {
    const {
      offset = 0,
      orderBy,
      order = Order.DESC,
      dao,
      status,
      type,
      proposer,
      active,
      failed,
      accountId,
    } = params;
    const limit = Math.min(params.limit || 50, 50);
    const query = await this.proposalRepository
      .createQueryBuilder('proposal')
      .select([
        'proposal.id',
        'proposal.daoId',
        'proposal.proposalId',
        'proposal.type',
        'proposal.kind',
        'proposal.description',
        'proposal.votes',
        'proposal.status',
        'proposal.voteStatus',
        'proposal.proposer',
        'proposal.votePeriodEnd',
        'proposal.transactionHash',
        'proposal.createdAt',
        'proposal.updatedAt',
        'proposal.commentsCount',
      ])
      .leftJoinAndSelect('proposal.actions', 'actions')
      .skip(offset)
      .take(Math.min(limit, 50));

    if (dao) {
      this.buildInArrayQuery(query, 'proposal.daoId', dao.split(','));
    }

    if (status) {
      this.buildInArrayQuery(query, 'proposal.status', status.split(','));
    }

    if (type) {
      this.buildInArrayQuery(query, 'proposal.type', type.split(','));
    }

    if (proposer) {
      this.buildInArrayQuery(query, 'proposal.proposer', proposer.split(','));
    }

    if (active) {
      query.andWhere('proposal.status = :status', {
        status: ProposalStatus.InProgress,
      });
      query.andWhere('proposal.voteStatus = :voteStatus', {
        voteStatus: ProposalVoteStatus.Active,
      });
      query.andWhere('proposal.votePeriodEnd > :timestamp', {
        timestamp: getBlockTimestamp(),
      });
    }

    if (failed) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where(`proposal.status IN (:...statuses)`, {
            statuses: [
              ProposalStatus.Rejected,
              ProposalStatus.Expired,
              ProposalStatus.Moved,
              ProposalStatus.Removed,
            ],
          });
          qb.orWhere(
            '(proposal.status != :status AND proposal.votePeriodEnd < :timestamp)',
            {
              status: ProposalStatus.Approved,
              timestamp: getBlockTimestamp(),
            },
          );
        }),
      );
    }

    this.buildVotedQuery(query, params);

    if (orderBy) {
      query.orderBy(`proposal.${orderBy}`, order);
    }

    const [proposals, total] = await query.getManyAndCount();

    return {
      limit,
      offset,
      total,
      data: await this.mapProposals(proposals, accountId),
    };
  }

  public async mapProposals(
    proposals: Proposal[],
    permissionsAccountId?: string,
  ): Promise<Proposal[]> {
    if (!proposals?.length) {
      return proposals;
    }

    const daoIds = [...new Set(proposals.map((proposal) => proposal.daoId))];
    const daoQueryBuilder = this.daoRepository
      .createQueryBuilder('dao')
      .leftJoin('dao.policy', 'policy')
      .select([
        'dao.id',
        'dao.transactionHash',
        'dao.config',
        'dao.numberOfMembers',
        'policy.daoId',
        'policy.defaultVotePolicy',
        'policy.defaultVotePolicy',
      ])
      .where('dao.id IN (:...daoIds)', { daoIds });
    let accountDelegations = [];

    if (permissionsAccountId) {
      daoQueryBuilder
        .leftJoin('policy.roles', 'role')
        .addSelect([
          'role.name',
          'role.kind',
          'role.accountIds',
          'role.balance',
          'role.permissions',
        ]);
      accountDelegations = await this.delegationRepository.find({
        select: ['daoId', 'balance'],
        where: {
          accountId: permissionsAccountId,
          daoId: In(daoIds),
        },
      });
    }

    const daos = (await daoQueryBuilder.getMany()).reduce(
      (daos, dao) => ({ ...daos, [dao.id]: dao }),
      {},
    );

    return proposals.map((proposal) => {
      const { policy: daoPolicy, ...dao } = daos[proposal.daoId];
      const { roles, ...policy } = daoPolicy;
      const accountDelegation = accountDelegations.find(
        ({ daoId }) => daoId === proposal.daoId,
      );
      proposal.dao = { ...dao, policy };

      return this.populateProposalPermissions(
        proposal,
        roles,
        permissionsAccountId,
        accountDelegation?.balance,
      );
    });
  }

  buildPermissionsSubQuery(
    query: SelectQueryBuilder<any>,
    accountId?: string,
    accountBalance?: bigint,
  ): SelectQueryBuilder<any> {
    query
      .select('pt.dao_id, array_agg(pt.perms) as dao_permissions')
      .from((subQuery) => {
        subQuery
          .select('r.policy_dao_id as dao_id, unnest(r.permissions) as perms')
          .from('role', 'r');

        if (accountId) {
          subQuery.orWhere(
            new Brackets((qb) => {
              qb.where('r.kind = :kindGroup', {
                kindGroup: RoleKindType.Group,
              }).andWhere(':accountId = ANY(r.account_ids)', { accountId });
            }),
          );
        }

        if (accountBalance) {
          subQuery.orWhere(
            new Brackets((qb) => {
              qb.where('r.kind = :kindMember', {
                kindMember: RoleKindType.Member,
              }).andWhere(':balance >= r.balance', {
                balance: String(accountBalance),
              });
            }),
          );
        }

        return subQuery;
      }, 'pt')
      .groupBy('dao_id');

    return query;
  }

  buildVotedQuery(
    query: SelectQueryBuilder<Proposal>,
    params: AccountProposalQuery | ProposalsRequest,
  ): SelectQueryBuilder<Proposal> {
    if (params.accountId && typeof params.voted === 'boolean') {
      query.andWhere(
        `${params.voted ? '' : 'NOT'} (votes ? '${params.accountId}')`,
      );
    }

    return query;
  }

  buildInArrayQuery(
    query: SelectQueryBuilder<Proposal>,
    field: string,
    arr: string[],
  ): SelectQueryBuilder<Proposal> {
    if (arr.length > 1) {
      query.andWhere(`${field} IN (:...${field})`, {
        [field]: arr,
      });
    } else if (arr.length === 1) {
      query.andWhere(`${field} = :${field}`, {
        [field]: arr[0],
      });
    }

    return query;
  }

  async getFeedByAccountId(
    accountId: string,
    req: CrudRequest,
    params: ProposalQuery,
  ): Promise<ProposalResponse | Proposal[]> {
    const queryBuilder = await super.createBuilder(req.parsed, req.options);
    queryBuilder
      .leftJoin(
        (subQuery) => this.buildPermissionsSubQuery(subQuery, accountId),
        'perms',
        'perms.dao_id = Proposal.dao_id',
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('proposer = :accountId', { accountId })
            .orWhere(':accountId = ANY(dao.accountIds)', { accountId })
            .orWhere(
              `array['*:*', '*:VoteApprove', Proposal.policy_label || ':VoteApprove'] && perms.dao_permissions`,
            )
            .orWhere(
              `array['*:*', '*:VoteReject', Proposal.policy_label || ':VoteReject'] && perms.dao_permissions`,
            )
            .orWhere(
              `array['*:*', '*:VoteRemove', Proposal.policy_label || ':VoteRemove'] && perms.dao_permissions`,
            );
        }),
      );

    const proposalResponse = await super.doGetMany(
      this.buildVotedQuery(queryBuilder, { ...params, accountId }),
      req.parsed,
      req.options,
    );

    return this.mapProposalFeed(proposalResponse, accountId);
  }

  public async getDaoProposalCount(daoId: string): Promise<number> {
    if (await this.useDynamoDB()) {
      return this.proposalDynamoService.count(daoId);
    } else {
      return this.proposalRepository.count({ daoId });
    }
  }

  public async getDaoActiveProposalCount(daoId: string): Promise<number> {
    if (await this.useDynamoDB()) {
      return this.proposalDynamoService.count(daoId, {
        FilterExpression:
          '#proposalStatus = :proposalStatus and voteStatus <> :voteStatus',
        ExpressionAttributeValues: {
          ':proposalStatus': ProposalStatus.InProgress,
          ':voteStatus': ProposalVoteStatus.Expired,
        },
        ExpressionAttributeNames: {
          '#proposalStatus': 'status',
        },
      });
    } else {
      return this.proposalRepository.count({
        daoId,
        status: ProposalStatus.InProgress,
        voteStatus: Not(ProposalVoteStatus.Expired),
      });
    }
  }

  async search(
    req: CrudRequest,
    params: SearchQuery,
  ): Promise<Proposal[] | ProposalResponse> {
    req.options.query.join = {
      dao: {
        eager: true,
        alias: 'dao',
        allow: ['id', 'config', 'transactionHash', 'numberOfMembers'],
      },
      'dao.policy': {
        eager: true,
        alias: 'policy',
        allow: ['defaultVotePolicy'],
      },
    };
    const likeQuery = `%${params.query.toLowerCase()}%`;
    const queryBuilder = await super.createBuilder(req.parsed, req.options);
    queryBuilder
      .where(`"Proposal".id ilike :likeQuery`, { likeQuery })
      .orWhere(`"Proposal".description ilike :likeQuery`, { likeQuery })
      .orWhere(`"Proposal".proposer ilike :likeQuery`, { likeQuery })
      .orWhere(`"Proposal".votes::text ilike :likeQuery`, { likeQuery });
    const proposalResponse = await super.doGetMany(
      this.buildVotedQuery(queryBuilder, params),
      req.parsed,
      req.options,
    );
    return this.mapProposalFeed(proposalResponse, params.accountId);
  }

  async findProposalsByDaoIds(
    daoIds: string[],
    voteStatus?: ProposalVoteStatus,
  ): Promise<Proposal[]> {
    let where: FindConditions<Proposal> = {
      daoId: In(daoIds),
    };

    if (voteStatus) {
      where = {
        ...where,
        voteStatus,
      };
    }

    return this.proposalRepository.find({ where });
  }

  async findDaoVoters(daoId: string) {
    return this.proposalRepository
      .createQueryBuilder('proposal')
      .select('proposal.votes')
      .where('proposal.daoId = :daoId', { daoId })
      .getMany();
  }

  async getExpiredProposalDaoIds(): Promise<string[]> {
    const currentTimestamp = new Date().getTime() * 1000 * 1000;
    const proposals = await this.proposalRepository
      .createQueryBuilder('proposal')
      .select('proposal.daoId')
      .distinctOn(['proposal.daoId'])
      .where('proposal.voteStatus != :voteStatus', {
        voteStatus: ProposalVoteStatus.Expired,
      })
      .andWhere('proposal.status = :status', {
        status: ProposalStatus.InProgress,
      })
      .andWhere('proposal.votePeriodEnd < :date', {
        date: currentTimestamp,
      })
      .getMany();
    return proposals.map(({ daoId }) => daoId);
  }

  async updateExpiredProposals(): Promise<UpdateResult> {
    const currentTimestamp = new Date().getTime() * 1000 * 1000; // nanoseconds
    return this.connection
      .createQueryBuilder()
      .update(Proposal)
      .where('voteStatus != :voteStatus', {
        voteStatus: ProposalVoteStatus.Expired,
      })
      .andWhere('status = :status', { status: ProposalStatus.InProgress })
      .andWhere('votePeriodEnd < :date', {
        date: currentTimestamp,
      })
      .set({ voteStatus: ProposalVoteStatus.Expired })
      .execute();
  }

  async remove(daoId: string, proposalId: number) {
    await this.proposalDynamoService.archive(daoId, String(proposalId));
    await this.proposalRepository.delete({
      id: buildProposalId(daoId, proposalId),
    });
  }

  async removeMultiple(proposalIds: string[]): Promise<DeleteResult[]> {
    return Promise.all(
      proposalIds.map((id) => this.proposalRepository.delete(id)),
    );
  }

  public async mapProposalFeed(
    proposalResponse: ProposalResponse | Proposal[],
    permissionsAccountId?: string,
  ): Promise<ProposalResponse | Proposal[]> {
    let proposals =
      proposalResponse instanceof Array
        ? proposalResponse
        : proposalResponse.data;

    if (!proposals || !proposals.length) {
      return proposalResponse;
    }

    const daoIds = [...new Set(proposals.map((proposal) => proposal.daoId))];
    let daoRoles = [];

    if (daoIds.length) {
      daoRoles = await this.roleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.policy', 'policy')
        .where('policy_dao_id IN (:...daoIds)', { daoIds })
        .getMany();
    }

    let accountDelegations = [];
    if (permissionsAccountId) {
      accountDelegations = await this.delegationRepository.find({
        select: ['daoId', 'balance'],
        where: {
          accountId: permissionsAccountId,
          daoId: In(daoIds),
        },
      });
    }

    proposals = proposals.map((proposal) => {
      const roles = daoRoles.filter(
        (role) => role.policy.daoId === proposal.daoId,
      );
      const accountDelegation = accountDelegations.find(
        ({ daoId }) => daoId === proposal.daoId,
      );
      return this.populateProposalPermissions(
        proposal,
        roles,
        permissionsAccountId,
        accountDelegation?.balance,
      );
    });

    if (proposalResponse instanceof Array) {
      return proposals;
    } else {
      return { ...proposalResponse, data: proposals };
    }
  }

  private populateProposalPermissions(
    proposal: Proposal,
    roles: Role[],
    accountId?: string,
    accountBalance = '0',
  ): Proposal {
    return {
      ...proposal,
      permissions: getAccountPermissions(
        roles,
        proposal.kind?.type,
        accountId,
        BigInt(accountBalance),
      ),
    } as Proposal;
  }
}
