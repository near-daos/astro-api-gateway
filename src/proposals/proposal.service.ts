import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { In, Repository } from 'typeorm';
import { ProposalDto } from './dto/proposal.dto';
import { Proposal } from './entities/proposal.entity';
import { ProposalResponse } from './dto/proposal-response.dto';
import { Role } from 'src/daos/entities/role.entity';

@Injectable()
export class ProposalService extends TypeOrmCrudService<Proposal> {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    super(proposalRepository);
  }

  create(proposalDto: ProposalDto): Promise<Proposal> {
    return this.proposalRepository.save({
      ...proposalDto,
      kind: proposalDto.kind.kind,
    });
  }

  async getMany(req: CrudRequest): Promise<ProposalResponse | Proposal[]> {
    const proposalResponse = await super.getMany(req);

    // populating Proposal Dao Policy with Roles
    const daoIds: Set<string> = new Set(
      (proposalResponse as ProposalResponse).data.map(({ daoId }) => daoId),
    );

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
}
