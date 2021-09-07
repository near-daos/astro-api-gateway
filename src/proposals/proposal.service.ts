import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dao } from 'src/daos/entities/dao.entity';
import { buildProposalId } from 'src/utils';
import { Like, Repository } from 'typeorm';
import { ProposalDto } from './dto/proposal.dto';
import { Proposal } from './entities/proposal.entity';
import { SearchQuery } from 'src/common';
import { ProposalQuery } from './dto/proposal-query.dto';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
  ) {}

  create(proposalDto: ProposalDto): Promise<Proposal> {
    return this.proposalRepository.save({
      ...proposalDto,
      kind: proposalDto.kind.kind,
    });
  }

  async find({
    daoId,
    offset,
    limit,
    order,
  }: ProposalQuery): Promise<Proposal[]> {
    return this.proposalRepository.find({
      skip: offset,
      take: limit,
      where: {
        dao: {
          id: daoId,
        },
      },
      order,
    });
  }

  findOne(id: string): Promise<Proposal> {
    return this.proposalRepository.findOne(id);
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
