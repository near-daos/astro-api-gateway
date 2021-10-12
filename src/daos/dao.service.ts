import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { Repository } from 'typeorm';
import { DaoDto } from './dto/dao.dto';
import { Dao } from './entities/dao.entity';
import { DaoResponse } from './dto/dao-response.dto';

@Injectable()
export class DaoService extends TypeOrmCrudService<Dao> {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
  ) {
    super(daoRepository);
  }

  async findAccountDaos(accountId: string): Promise<Dao[] | DaoResponse> {
    return await this.daoRepository
      .createQueryBuilder('dao')
      .leftJoinAndSelect('dao.policy', 'policy')
      .leftJoinAndSelect('policy.roles', 'roles')
      .andWhere(`:accountId = ANY(roles.accountIds)`, {
        accountId,
      })
      .orderBy('dao.createTimestamp', 'DESC')
      .getMany();
  }

  async create(daoDto: DaoDto): Promise<Dao> {
    return this.daoRepository.save(daoDto);
  }

  async update(daoDto: DaoDto): Promise<any> {
    return this.daoRepository.update({ id: daoDto.id }, daoDto);
  }

  async search(req: CrudRequest, query: string): Promise<Dao[] | DaoResponse> {
    req.options.query.join = {
      policy: {
        eager: true,
      },
      'policy.roles': {
        eager: true,
      },
    };

    req.parsed.search = {
      $and: [
        {},
        {
          $or: [
            {
              id: { $contL: query },
            },
            {
              description: { $contL: query },
            },
            {
              config: { $contL: query },
            },
            {
              'policy.roles.accountIds': { $in: [`{${query}}`] },
            },
          ],
        },
      ],
    };

    return this.getMany(req);
  }
}
