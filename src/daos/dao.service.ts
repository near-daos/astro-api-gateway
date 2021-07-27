import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PagingQuery, SearchQuery } from 'src/common';
import { Repository } from 'typeorm';
import { CreateDaoDto } from './dto/dao.dto';
import { Dao } from './entities/dao.entity';

@Injectable()
export class DaoService {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
  ) { }

  create(daoDto: CreateDaoDto): Promise<Dao> {
    const dao = new Dao();

    dao.id = daoDto.id;
    dao.amount = daoDto.amount;
    dao.bond = daoDto.bond;
    dao.purpose = daoDto.purpose;
    dao.votePeriod = daoDto.votePeriod;
    dao.members = daoDto.members;
    dao.numberOfMembers = daoDto.numberOfMembers;
    dao.numberOfProposals = daoDto.numberOfProposals;

    return this.daoRepository.save(dao);
  }

  async find({ offset, limit }: PagingQuery): Promise<Dao[]> {
    return this.daoRepository.find({ skip: offset, take: limit });
  }

  findOne(id: string): Promise<Dao> {
    return this.daoRepository.findOne(id);
  }

  async findByQuery({ query, offset, limit }: SearchQuery): Promise<Dao[]> {
    return this.daoRepository
      .createQueryBuilder('dao')
      .where("dao.id like :id", { id: `%${query}%` })
      .skip(offset)
      .take(limit)
      .getMany();
  }
}