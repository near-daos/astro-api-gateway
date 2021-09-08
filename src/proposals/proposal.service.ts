import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { Like, Repository } from 'typeorm';
import { ProposalDto } from './dto/proposal.dto';
import { Proposal } from './entities/proposal.entity';
import { SearchQuery } from 'src/common';
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
    return super.getMany({
      ...req,
      options: {
        ...req.options,
        query: {
          join: {
            dao: {
              eager: true,
            },
            'dao.policy': {
              eager: true,
            },
          },
        },
      },
    });
  }

  async findByQuery({
    query,
    offset,
    limit,
    order,
  }: SearchQuery): Promise<Proposal[]> {
    return this.proposalRepository.find({
      skip: offset,
      take: limit,
      where: [
        { id: Like(`%${query}%`) },
        { target: Like(`%${query}%`) },
        { proposer: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
        { votes: Like(`%${query}%`) },
      ],
      order,
    });
  }
}
