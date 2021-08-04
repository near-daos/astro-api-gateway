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

  async findAccountByAccountId(accountId: String): Promise<Account[]> {
    return this.accountRepository
      .createQueryBuilder('account')
      .where("account.account_id like :id", { id: `%${accountId}%` })
      .getMany();
  }

  async findReceiptByReceiptId(receiptId: String): Promise<Receipt> {
    return this.receiptRepository
      .createQueryBuilder('receipt')
      .where("receipt.receipt_id like :id", { id: `%${receiptId}%` })
      .getOne();
  }

  async findTransactionsByReceiverAccountId(receiverAccountId: String): Promise<Transaction[]> {
    return this.transactionRepository
      .createQueryBuilder('transaction')
      .where("transaction.receiver_account_id like :id", { id: `%${receiverAccountId}%` })
      .getMany();
  }

  async findTransactionActionByHash(txHash: String): Promise<TransactionAction> {
    return this.transactionActionRepository
      .createQueryBuilder('transaction_action')
      .where("transaction_action.transaction_hash like :hash", { hash: `%${txHash}%` })
      .getOne();
  }
}
