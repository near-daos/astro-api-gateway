import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { Repository } from 'typeorm';
import { ProposalDto } from './dto/proposal.dto';
import { Proposal } from './entities/proposal.entity';
import { ProposalResponse } from './dto/proposal-response.dto';

@Injectable()
export class ProposalService extends TypeOrmCrudService<Proposal> {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
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
    return super.getMany(req);
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
