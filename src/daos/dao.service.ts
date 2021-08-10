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
    return this.daoRepository.save(daoDto);
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
      .orWhere("dao.purpose like :purpose", { purpose: `%${query}%` })
      .orWhere("array_to_string(dao.council, ',') like :council", { council: `%${query}%`})
      .skip(offset)
      .take(limit)
      .getMany();
  }
}