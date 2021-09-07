import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { SearchQuery } from 'src/common';
import { Like, Repository } from 'typeorm';
import { BountyDto } from './dto/bounty.dto';
import { Bounty } from './entities/bounty.entity';

@Injectable()
export class BountyService extends TypeOrmCrudService<Bounty> {
  constructor(
    @InjectRepository(Bounty)
    private readonly bountyRepository: Repository<Bounty>,
  ) {
    super(bountyRepository);
  }

  async create(bountyDto: BountyDto): Promise<Bounty> {
    return this.bountyRepository.save(bountyDto);
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
