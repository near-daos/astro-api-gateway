import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from 'src/near/entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // Just a transit between Near Indexer DB and the local one - so no DTO there for it
  create(transaction: Transaction): Promise<Transaction> {
    return this.transactionRepository.save(transaction);
  }

  lastTransaction(): Promise<Transaction> {
    return this.transactionRepository.findOne({
      order: { blockTimestamp: 'DESC' },
    });
  }

  count(): Promise<number> {
    return this.transactionRepository.count();
  }
}
