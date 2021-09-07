import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Dao } from './entities/dao.entity';

@Injectable()
export class DaoOrmService extends TypeOrmCrudService<Dao> {
  constructor(@InjectRepository(Dao) daoRepository: Repository<Dao>) {
    super(daoRepository);
  }
}
