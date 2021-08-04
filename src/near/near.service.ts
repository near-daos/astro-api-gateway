import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { Receipt } from './entities/receipt.entity';
import { TransactionAction } from './entities/transaction-action.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class NearService {
  constructor(
    @InjectRepository(Account, NEAR_INDEXER_DB_CONNECTION)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Receipt, NEAR_INDEXER_DB_CONNECTION)
    private readonly receiptRepository: Repository<Receipt>,

    @InjectRepository(Transaction, NEAR_INDEXER_DB_CONNECTION)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(TransactionAction, NEAR_INDEXER_DB_CONNECTION)
    private readonly transactionActionRepository: Repository<TransactionAction>,
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
      .where("account.account_id like :id", { id: `%${contractName}%` })
      .getMany();
  }

  async findReceiptsByReceiptIds(receiptIds: String[]): Promise<Receipt[]> {
    return this.receiptRepository
      .createQueryBuilder('receipt')
      .where("receipt.receipt_id = ANY(ARRAY[:...ids])", { ids: receiptIds })
      .getMany();
  }

  async findTransactionsByReceiverAccountIds(receiverAccountIds: String[]): Promise<Transaction[]> {
    return this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.transactionAction', 'transaction_actions')
      .where("transaction.receiver_account_id = ANY(ARRAY[:...ids])", { ids: receiverAccountIds })
      .orderBy('transaction.block_timestamp', 'ASC')
      .getMany();
  }

  async findTransactionActionsByHashes(txHashes: String[]): Promise<TransactionAction[]> {
    return this.transactionActionRepository
      .createQueryBuilder('transaction_action')
      .where("transaction_action.transaction_hash ANY(ARRAY[:...hashes])", { hashes: txHashes })
      .getMany();
  }
}
