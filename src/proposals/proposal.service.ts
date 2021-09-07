import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Like, Repository } from 'typeorm';
import { ProposalDto } from './dto/proposal.dto';
import { Proposal } from './entities/proposal.entity';
import { SearchQuery } from 'src/common';

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
