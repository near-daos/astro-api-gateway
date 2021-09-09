import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { Account, Receipt } from 'src/near';
import { NearService } from 'src/near/near.service';
import { ExecutionOutcomeStatus } from 'src/near/types/execution-outcome-status';
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
    private readonly configService: ConfigService,
    private readonly nearService: NearService,
  ) {
    super(daoRepository);
  }

  async createDraft(daoDto: CreateDaoDto): Promise<Dao> {
    return this.create({
      ...daoDto,
      status: DaoStatus.Pending,
    });
  }

  async create(daoDto: DaoDto): Promise<Dao> {
    return this.daoRepository.save(daoDto);
  }

  async getMany(req: CrudRequest): Promise<DaoResponse | Dao[]> {
    return super.getMany(req);
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

  async processTransactionCallback(transactionHash: string): Promise<any> {
    const { contractName } = this.configService.get('near');

    const receipt: Receipt =
      await this.nearService.findReceiptByTransactionHashAndPredecessor(
        transactionHash,
        contractName,
      );

    const {
      receiptId,
      originatedFromTransactionHash,
      originatedFromTransaction,
    } = receipt || {};
    if (
      !originatedFromTransaction ||
      originatedFromTransaction.status !==
        ExecutionOutcomeStatus.SuccessReceiptId
    ) {
      return;
    }

    const account: Account = await this.nearService.findAccountByReceiptId(
      receiptId,
    );
    if (!account) {
      return;
    }

    // Assuming that Dao has been created successfully - changing status to DaoStatus.Success
    return this.daoRepository.save({
      id: account.accountId,
      status: DaoStatus.Success,
      transactionHash: originatedFromTransactionHash,
    });
  }

  async clearPendingDaos(dateBefore: Date): Promise<DeleteResult> {
    return this.daoRepository.delete({
      status: DaoStatus.Pending,
      updatedAt: LessThanOrEqual(dateBefore),
    });
  }
}
