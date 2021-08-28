import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchQuery } from 'src/common';
import { Account, Receipt } from 'src/near';
import { NearService } from 'src/near/near.service';
import { ExecutionOutcomeStatus } from 'src/near/types/execution-outcome-status';
import { Repository } from 'typeorm';
import { DaoQuery } from './dto/dao-query.dto';
import { DaoDto } from './dto/dao.dto';
import { Dao } from './entities/dao.entity';
import { DaoStatus } from './types/dao-status';

@Injectable()
export class DaoService {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    private readonly configService: ConfigService,
    private readonly nearService: NearService,
  ) {}

  async createDraft(daoDto: DaoDto): Promise<Dao> {
    return this.create({
      ...daoDto,
      councilSeats: daoDto.council ? daoDto.council.length : 0,
      status: DaoStatus.Pending,
    });
  }

  async create(daoDto: DaoDto): Promise<Dao> {
    return this.daoRepository.save(daoDto);
  }

  async find({ offset, limit, order }: DaoQuery): Promise<Dao[]> {
    return this.daoRepository.find({
      where: [{ status: null }, { status: DaoStatus.Success }],
      skip: offset,
      take: limit,
      order,
    });
  }

  async findOne(id: string): Promise<Dao> {
    return this.daoRepository.findOne(id, {
      where: [
        { id, status: null },
        { id, status: DaoStatus.Success },
      ],
    });
  }

  async findByQuery({ query, offset, limit }: SearchQuery): Promise<Dao[]> {
    return this.daoRepository
      .createQueryBuilder('dao')
      .where('dao.id like :id', { id: `%${query}%` })
      .orWhere('dao.purpose like :purpose', { purpose: `%${query}%` })
      .orWhere("array_to_string(dao.council, ',') like :council", {
        council: `%${query}%`,
      })
      .skip(offset)
      .take(limit)
      .getMany();
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
}
