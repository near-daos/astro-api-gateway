import { FindManyOptions } from 'typeorm';
import { Dao } from '../entities/dao.entity';

export class DaoSortParam implements FindManyOptions<Dao> {}
