import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import {
  Connection,
  DeleteResult,
  FindConditions,
  In,
  Not,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Role } from '@sputnik-v2/dao/entities';

import { ProposalDto, ProposalResponse } from './dto';
import { Proposal } from './entities';
import {
  ProposalTypeToContractType,
  ProposalStatus,
  ProposalVoteStatus,
  ProposalPermissions,
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

  async getFeed(
    req: CrudRequest,
    permissionsAccountId?: string,
  ): Promise<ProposalResponse | Proposal[]> {
    const proposalResponse = await super.getMany(req);
    return this.mapProposalFeed(proposalResponse, permissionsAccountId);
  }

  async getFeedByAccountId(
    accountId: string,
    req: CrudRequest,
  ): Promise<ProposalResponse | Proposal[]> {
    const queryBuilder = await super.createBuilder(req.parsed, req.options);
    queryBuilder.andWhere(
      ':accountId = ANY(dao.accountIds) OR proposer = :accountId',
      { accountId },
    );
    const proposalResponse = await super.doGetMany(
      queryBuilder,
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
    query: string,
    accountId?: string,
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
              proposer: { $contL: query },
            },
            {
              votes: { $contL: query },
            },
          ],
        },
      ],
    };

    return this.getFeed(req, accountId);
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

  private async mapProposalFeed(
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

    if (permissionsAccountId) {
      const roles = await this.roleRepository
        .createQueryBuilder('role')
        .select([
          'policy.daoId',
          'role.permissions',
          'role.name',
          'role.accountIds',
        ])
        .leftJoin('role.policy', 'policy')
        .where('policy.daoId = ANY(ARRAY[:...ids])', {
          ids: [...new Set(proposals.map(({ dao }) => dao.id))],
        })
        .getMany();
      const daoRolesMap = roles.reduce((daoRolesMap, role) => {
        if (!daoRolesMap[role.policy.daoId]) {
          daoRolesMap[role.policy.daoId] = [role];
        } else {
          daoRolesMap[role.policy.daoId].push(role);
        }
        return daoRolesMap;
      }, {});
      proposals = proposals.map((proposal) =>
        this.populateProposalPermissions(
          proposal,
          daoRolesMap[proposal.dao.id],
          permissionsAccountId,
        ),
      );
    }

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
      permissions: accountId
        ? this.getAccountPermissions(accountId, proposal, roles)
        : undefined,
    } as Proposal;
  }

  private getAccountPermissions(
    accountId: string,
    proposal: Proposal,
    roles: Role[],
  ): ProposalPermissions {
    const groupRole = roles.filter(({ accountIds }) => {
      return accountIds?.includes(accountId);
    });

    return groupRole.reduce(
      (acc, { permissions, name }) => {
        const { canApprove, canReject, canDelete, isCouncil } = acc;

        if (!isCouncil) {
          acc.isCouncil = name.toLowerCase() === 'council';
        }

        if (!canApprove) {
          acc.canApprove = this.checkPermissions(
            proposal,
            'VoteApprove',
            permissions,
          );
        }

        if (!canReject) {
          acc.canReject = this.checkPermissions(
            proposal,
            'VoteReject',
            permissions,
          );
        }

        if (!canDelete) {
          acc.canDelete = this.checkPermissions(
            proposal,
            'VoteRemove',
            permissions,
          );
        }

        return acc;
      },
      {
        canApprove: false,
        canReject: false,
        canDelete: false,
        isCouncil: false,
      } as ProposalPermissions,
    );
  }

  private checkPermissions(
    proposal: Proposal,
    permission: string,
    permissions: string[],
  ): boolean {
    const type = ProposalTypeToContractType[proposal.kind.type];

    return (
      permissions.includes('*:*') ||
      permissions.includes(`*:${permission}`) ||
      permissions.includes(`${type}:${permission}`)
    );
  }
}
