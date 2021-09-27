import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { DeleteResult, LessThanOrEqual, Repository } from 'typeorm';
import { CreateDaoDto } from './dto/dao-create.dto';
import { DaoDto } from './dto/dao.dto';
import { Dao } from './entities/dao.entity';
import { DaoStatus } from './types/dao-status';
import { DaoResponse } from './dto/dao-response.dto';

@Injectable()
export class DaoService extends TypeOrmCrudService<Dao> {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
  ) {
    super(daoRepository);
  }

  async createDraft(daoDto: CreateDaoDto): Promise<Dao> {
    return this.create({
      ...daoDto,
      status: DaoStatus.Pending,
    });
  }

  async findAccountDaos(accountId: string): Promise<Dao[] | DaoResponse> {
    return await this.daoRepository
      .createQueryBuilder('dao')
      .leftJoinAndSelect('dao.policy', 'policy')
      .leftJoinAndSelect('policy.roles', 'roles')
      .where(`:accountId = ANY(roles.accountIds)`, {
        accountId,
      })
      .orderBy('dao.createTimestamp', 'DESC')
      .getMany();
  }

  async create(daoDto: DaoDto): Promise<Dao> {
    return this.daoRepository.save(daoDto);
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

  async clearPendingDaos(dateBefore: Date): Promise<DeleteResult> {
    return this.daoRepository.delete({
      status: DaoStatus.Pending,
      updatedAt: LessThanOrEqual(dateBefore),
    });
  }
}
