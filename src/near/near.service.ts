import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class NearService {
  constructor(
    @InjectRepository(Account, NEAR_INDEXER_DB_CONNECTION)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Transaction, NEAR_INDEXER_DB_CONNECTION)
    private readonly transactionRepository: Repository<Transaction>,
  ) { }

  /**
   * Using parent contract name to retrieve child information since
   * child accounts are built based on parent contract name domain
   * see: 
   *    genesis.sputnik-v1.testnet 
   * is built on top of 
   *    sputnik-v1.testnet account
   */
  async findAccountsByContractName(contractName: String): Promise<Account[]> {
    return this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.receipt', 'receipts')
      .where("account.account_id like :id", { id: `%${contractName}%` })
      .getMany();
  }

  async findTransactionsByReceiverAccountIds(receiverAccountIds: String[], fromBlockTimestamp?: Number): Promise<Transaction[]> {
    let queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.transactionAction', 'transaction_actions')
      .where("transaction.receiver_account_id = ANY(ARRAY[:...ids])", { ids: receiverAccountIds })
      .orderBy('transaction.block_timestamp', 'ASC');

    queryBuilder = fromBlockTimestamp
      ? queryBuilder.andWhere("transaction.block_timestamp > :from", { from: fromBlockTimestamp })
      : queryBuilder;

    return queryBuilder.getMany();
  }

  async lastTransaction(receiverAccountIds: String[]): Promise<Transaction> {
    return this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.transactionAction', 'transaction_actions')
      .where("transaction.receiver_account_id = ANY(ARRAY[:...ids])", { ids: receiverAccountIds })
      .orderBy('transaction.block_timestamp', 'DESC')
      .getOne()
  }
}
