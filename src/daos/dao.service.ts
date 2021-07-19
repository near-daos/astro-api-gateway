import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async findAll(): Promise<Dao[]> {
    return this.daoRepository.find();
  }

  findOne(id: string): Promise<Dao> {
    return this.daoRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.daoRepository.delete(id);
  }
}