import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import {
  Connection,
  DeleteResult,
  FindConditions,
  In,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Role } from '@sputnik-v2/dao';

import { ProposalDto, ProposalResponse } from './dto';
import { Proposal } from './entities';
import {
  ProposalTypeToContractType,
  ProposalStatus,
  ProposalVoteStatus,
} from './types';

@Injectable()
export class ProposalService extends TypeOrmCrudService<Proposal> {
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
    return Promise.all(
      proposalDtos.map((proposalDto) => this.create(proposalDto)),
    );
  }

  async getMany(req: CrudRequest): Promise<ProposalResponse | Proposal[]> {
    const proposalResponse = await super.getMany(req);

    const proposals =
      proposalResponse instanceof Array
        ? proposalResponse
        : proposalResponse.data;

    if (!proposals || !proposals.length) {
      return proposalResponse;
    }

    // populating Proposal Dao Policy with Roles
    const daoIds: Set<string> = new Set(proposals.map(({ daoId }) => daoId));

    const roles = await this.roleRepository.find({
      where: { policy: { daoId: In([...daoIds]) } },
      join: {
        alias: 'role',
        leftJoinAndSelect: { policy: 'role.policy' },
      },
    });

    (proposalResponse as ProposalResponse).data.map((proposal) => {
      proposal.dao.policy = {
        ...proposal.dao.policy,
        roles: roles
          .filter(({ policy }) => policy.daoId === proposal.daoId)
          .map((role) => ({
            ...role,
            policy: { daoId: role.policy.daoId },
          })) as any,
      };
    });

    return proposalResponse;
  }

  async getManyByAccountId(
    accountId: string,
    req: CrudRequest,
  ): Promise<ProposalResponse | Proposal[]> {
    const proposalResponse = (await this.getMany({
      ...req,
      parsed: {
        ...req.parsed,
        offset: 0,
        limit: 10000, // TODO: chunk proposal queries
      },
    })) as ProposalResponse;

    const filtered = proposalResponse.data.filter((proposal) => {
      const groupRole = proposal?.dao?.policy?.roles?.filter(
        ({ kind, accountIds }) => {
          return kind === 'Group' && accountIds?.includes(accountId);
        },
      );

      function checkPermissions(permission: string, groupPerms: string[]) {
        const type = ProposalTypeToContractType[proposal.kind.type];

        return (
          groupPerms.includes('*:*') ||
          groupPerms.includes(`*:${permission}`) ||
          groupPerms.includes(`${type}:${permission}`)
        );
      }

      const perms = groupRole.reduce(
        (acc, { permissions: groupPerms }) => {
          const { canApprove, canReject, canDelete } = acc;

          if (!canApprove) {
            acc.canApprove = checkPermissions('VoteApprove', groupPerms);
          }

          if (!canReject) {
            acc.canReject = checkPermissions('VoteReject', groupPerms);
          }

          if (!canDelete) {
            acc.canDelete = checkPermissions('VoteRemove', groupPerms);
          }

          return acc;
        },
        {
          canApprove: false,
          canReject: false,
          canDelete: false,
        },
      );

      return perms.canApprove || perms.canReject || perms.canDelete;
    });

    const { offset, limit } = req.parsed;
    const total = filtered.length;
    const page = limit ? Math.floor(offset / limit) + 1 : 1;
    const data = filtered.slice(offset, page * limit);
    const pageCount = limit && total ? Math.ceil(total / limit) : 1;

    const response = {
      ...proposalResponse,
      data,
      page,
      pageCount,
      count: data.length,
      total,
    };

    return response;
  }

  async search(
    req: CrudRequest,
    query: string,
  ): Promise<Proposal[] | ProposalResponse> {
    req.options.query.join = {
      dao: {
        eager: true,
      },
      'dao.policy': {
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
              proposer: { $contL: query },
            },
            {
              votes: { $contL: query },
            },
          ],
        },
      ],
    };

    return this.getMany(req);
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

  async updateExpiredProposals(): Promise<UpdateResult> {
    const currentTimestamp = new Date().getTime() * 1000 * 1000; // nanoseconds

    return this.connection
      .createQueryBuilder()
      .update(Proposal)
      .where('voteStatus != :voteStatus', {
        voteStatus: ProposalVoteStatus.Expired,
      })
      .andWhere('status = :status', { status: ProposalStatus.InProgress })
      .andWhere('votePeriodEnd > :date', {
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
}
