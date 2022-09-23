import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '@sputnik-v2/near-indexer';
import { CacheService } from '@sputnik-v2/cache';
import {
  ContractHandlerResult,
  TransactionHandlerService,
} from '@sputnik-v2/transaction-handler';

import { castEmptyTransaction } from './types';

@Injectable()
export class TransactionService extends TypeOrmCrudService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly transactionHandler: TransactionHandlerService,
    private readonly cacheService: CacheService,
  ) {
    super(transactionRepository);
  }

  // Just a transit between Near Indexer DB and the local one - so no DTO there for it
  create(transaction: Transaction): Promise<Transaction> {
    return this.transactionRepository.save(transaction);
  }

  createMultiple(transactions: Transaction[]): Promise<Transaction[]> {
    return this.transactionRepository.save(transactions);
  }

  lastTransaction(): Promise<Transaction> {
    return this.transactionRepository.findOne({
      order: { blockTimestamp: 'DESC' },
    });
  }

  public async findBountyClaimTransactions(
    daoId?: string,
  ): Promise<Transaction[]> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.transactionAction', 'transaction_actions')
      .where("transaction_actions.args->>'method_name' = 'bounty_claim'");

    if (daoId) {
      queryBuilder.andWhere('transaction.receiver_account_id = :daoId', {
        daoId,
      });
    }

    return queryBuilder.getMany();
  }

  public async walletCallback(
    transactionHash: string,
    accountId: string,
  ): Promise<ContractHandlerResult[]> {
    const results = await this.transactionHandler.handleNearTransaction(
      transactionHash,
      accountId,
    );
    await this.cacheService.clearCache();
    await this.create(castEmptyTransaction(transactionHash, accountId));

    return results;
  }
}
