import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '@sputnik-v2/near-indexer';
import { CacheService } from '@sputnik-v2/cache';
import { TransactionHandlerService } from '@sputnik-v2/transaction-handler';

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

  lastTransaction(): Promise<Transaction> {
    return this.transactionRepository.findOne({
      order: { blockTimestamp: 'DESC' },
    });
  }

  public async findBountyClaimTransactions(): Promise<Transaction[]> {
    return this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.transactionAction', 'transaction_actions')
      .where("transaction_actions.args->>'method_name' = 'bounty_claim'")
      .getMany();
  }

  public async walletCallback(transactionHash: string, accountId: string) {
    await this.transactionHandler.handleNearTransaction(
      transactionHash,
      accountId,
    );
    await this.cacheService.clearCache();
  }
}
