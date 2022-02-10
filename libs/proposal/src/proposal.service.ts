import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
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
import { Role, RoleKindType } from '@sputnik-v2/dao/entities';
import { SearchQuery } from '@sputnik-v2/common';

import {
  AccountProposalQuery,
  ProposalDto,
  ProposalQuery,
  ProposalResponse,
} from './dto';
import { Proposal } from './entities';
import {
  ProposalPermissions,
  ProposalStatus,
  ProposalType,
  ProposalTypeToPolicyLabel,
  ProposalVoteStatus,
} from './types';

@Injectable()
export class ProposalService extends TypeOrmCrudService<Proposal> {
  private readonly logger = new Logger(ProposalService.name);

  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectConnection()
    private connection: Connection,
  ) {
    super(proposalRepository);
  }

  create(proposalDto: ProposalDto): Promise<Proposal> {
    return this.proposalRepository.save({
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

  async getById(
    proposalId: string,
    permissionsAccountId?: string,
  ): Promise<Proposal> {
    const proposal: Proposal = await this.findOne(proposalId);

    if (!proposal) {
      throw new BadRequestException('Invalid Proposal ID');
    }

    return this.populateProposalPermissions(
      proposal,
      proposal.dao.policy.roles,
      permissionsAccountId,
    );
  }

  async getFeed(
    req: CrudRequest,
    params: AccountProposalQuery,
  ): Promise<ProposalResponse | Proposal[]> {
    const queryBuilder = await super.createBuilder(req.parsed, req.options);
    const proposalResponse = await super.doGetMany(
      this.buildVotedQuery(queryBuilder, params),
      req.parsed,
      req.options,
    );
    return this.mapProposalFeed(proposalResponse, params.accountId);
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
          .from('role', 'r')
          .where('r.kind = :kindEveryone', {
            kindEveryone: RoleKindType.Everyone,
          });

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
    params: AccountProposalQuery,
  ): SelectQueryBuilder<Proposal> {
    if (params.accountId && typeof params.voted === 'boolean') {
      query.andWhere(
        `${params.voted ? '' : 'NOT'} (votes ? '${params.accountId}')`,
      );
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
    return this.proposalRepository.count({ daoId });
  }

  public async getDaoActiveProposalCount(daoId: string): Promise<number> {
    return this.proposalRepository.count({
      daoId,
      status: ProposalStatus.InProgress,
      voteStatus: Not(ProposalVoteStatus.Expired),
    });
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
      'dao.policy.roles': {
        eager: true,
        alias: 'roles',
        allow: ['name', 'kind', 'accountIds', 'permissions'],
      },
    };

    req.parsed.search = {
      $and: [
        {},
        {
          $or: [
            {
              id: { $contL: params.query },
            },
            {
              description: { $contL: params.query },
            },
            {
              proposer: { $contL: params.query },
            },
            {
              votes: { $contL: params.query },
            },
          ],
        },
      ],
    };

    return this.getFeed(req, params);
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

  async remove(id: string): Promise<DeleteResult> {
    return await this.proposalRepository.delete({ id });
  }

  async removeMultiple(proposalIds: string[]): Promise<DeleteResult[]> {
    return Promise.all(proposalIds.map((id) => this.remove(id)));
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

    proposals = proposals.map((proposal) => {
      const roles = daoRoles.filter(
        (role) => role.policy.daoId === proposal.daoId,
      );
      return this.populateProposalPermissions(
        proposal,
        roles,
        permissionsAccountId,
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
  ): Proposal {
    return {
      ...proposal,
      permissions: this.getAccountPermissions(proposal, roles, accountId),
    } as Proposal;
  }

  private getAccountPermissions(
    proposal: Proposal,
    roles: Role[],
    accountId?: string,
    accountBalance?: bigint,
  ): ProposalPermissions {
    const council = roles.find((role) => role.name.toLowerCase() === 'council');
    const permissions = roles.reduce((roles, role) => {
      if (
        role.kind === RoleKindType.Everyone ||
        (role.kind === RoleKindType.Group &&
          role.accountIds.includes(accountId)) ||
        (role.kind === RoleKindType.Member && accountBalance >= role.balance)
      ) {
        return [...roles, ...role.permissions];
      }
      return roles;
    }, []);

    return {
      isCouncil: council ? council.accountIds.includes(accountId) : false,
      canApprove: this.checkPermissions(
        proposal.kind.type,
        'VoteApprove',
        permissions,
      ),
      canReject: this.checkPermissions(
        proposal.kind.type,
        'VoteReject',
        permissions,
      ),
      canDelete: this.checkPermissions(
        proposal.kind.type,
        'VoteRemove',
        permissions,
      ),
    };
  }

  private checkPermissions(
    type: ProposalType,
    permission: string,
    permissions: string[],
  ): boolean {
    const policyLabel = ProposalTypeToPolicyLabel[type];
    return (
      permissions.includes('*:*') ||
      permissions.includes(`*:${permission}`) ||
      permissions.includes(`${policyLabel}:${permission}`)
    );
  }
}
