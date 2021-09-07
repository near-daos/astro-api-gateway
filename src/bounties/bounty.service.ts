import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchQuery } from 'src/common';
import { Like, Repository } from 'typeorm';
import { BountyQuery } from './dto/bounty-query.dto';
import { BountyDto } from './dto/bounty.dto';
import { Bounty } from './entities/bounty.entity';

@Injectable()
export class BountyService {
  constructor(
    @InjectRepository(Bounty)
    private readonly bountyRepository: Repository<Bounty>,
  ) {}

  async create(bountyDto: BountyDto): Promise<Bounty> {
    return this.bountyRepository.save(bountyDto);
  }

  async find({ daoId, offset, limit, order }: BountyQuery): Promise<Bounty[]> {
    return this.bountyRepository.find({
      where: {
        dao: {
          id: daoId,
        },
      },
      skip: offset,
      take: limit,
      order,
    });
  }

  async findOne(id: string): Promise<Bounty> {
    return this.bountyRepository.findOne(id, {
      where: [{ id, status: null }],
    });
  }

  async findByQuery({
    query,
    offset,
    limit,
    order,
  }: SearchQuery): Promise<Bounty[]> {
    return this.bountyRepository.find({
      skip: offset,
      take: limit,
      where: [
        { daoId: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
      ],
      order,
    });
  }
}
