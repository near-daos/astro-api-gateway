import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PromisePool from '@supercharge/promise-pool';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import { Repository } from 'typeorm';
import { Account, Transaction } from '.';
import { ActionReceiptAction } from './entities/action-receipt-action.entity';
import { Receipt } from './entities/receipt.entity';

@Injectable()
export class NearService {
  constructor(
    @InjectRepository(Account, NEAR_INDEXER_DB_CONNECTION)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Transaction, NEAR_INDEXER_DB_CONNECTION)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Receipt, NEAR_INDEXER_DB_CONNECTION)
    private readonly receiptRepository: Repository<Receipt>,

    @InjectRepository(ActionReceiptAction, NEAR_INDEXER_DB_CONNECTION)
    private readonly actionReceiptActionRepository: Repository<ActionReceiptAction>,
  ) {}

  /**
   * Using parent contract name to retrieve child information since
   * child accounts are built based on parent contract name domain
   * see: 
   *    genesis.sputnikv2.testnet 
   * is built on top of 
   *    sputnikv2.testnet account
   */
  async findAccountsByContractName(contractName: string): Promise<Account[]> {
    return this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.receipt', 'receipts')
      .where('account.account_id like :id', { id: `%${contractName}%` })
      .getMany();
  }

  async findTransactionsByReceiverAccountIds(
    receiverAccountIds: string[],
    fromBlockTimestamp?: number,
  ): Promise<Transaction[]> {
    let queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.transactionAction', 'transaction_actions')
      .where('transaction.receiver_account_id = ANY(ARRAY[:...ids])', {
        ids: receiverAccountIds,
      })
      .orderBy('transaction.block_timestamp', 'ASC');

    queryBuilder = fromBlockTimestamp
      ? queryBuilder.andWhere('transaction.block_timestamp >= :from', {
          from: fromBlockTimestamp,
        })
      : queryBuilder;

    return queryBuilder.getMany();
  }

  async findNFTActionReceiptsByReceiverAccountIds(
    receiverAccountIds: string[],
    fromBlockTimestamp?: number,
  ): Promise<ActionReceiptAction[]> {
    const { results: actionReceipts, errors } =
      await PromisePool.withConcurrency(5)
        .for(receiverAccountIds)
        .process(async (id) => {
          let queryBuilder = this.actionReceiptActionRepository
            .createQueryBuilder('action_receipt_action')
            .leftJoinAndSelect(
              'action_receipt_action.transaction',
              'transactions',
            )
            .where(
              "action_receipt_action.args->'args_json'->>'receiver_id' = :id and action_kind = 'FUNCTION_CALL' and action_receipt_action.args->>'args_json' is not null and args->>'method_name' like 'nft_%'",
              {
                id,
              },
            );

          queryBuilder = fromBlockTimestamp
            ? queryBuilder.andWhere('transaction.block_timestamp >= :from', {
                from: fromBlockTimestamp,
              })
            : queryBuilder;

          return await queryBuilder.getMany();
        });

    return actionReceipts.reduce((acc, prop) => acc.concat(prop), []);
  }

  async findTransaction(transactionHash: string): Promise<Transaction> {
    return this.transactionRepository.findOne(transactionHash);
  }

  async findReceiptByTransactionHashAndPredecessor(
    transactionHash: string,
    predecessorAccountId: string,
  ): Promise<Receipt> {
    //TODO: Revise a possibility of multiple receipts with the query below
    return this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.originatedFromTransaction', 'transactions')
      .where('receipt.originated_from_transaction_hash = :transactionHash', {
        transactionHash,
      })
      .andWhere('receipt.predecessor_account_id like :id', {
        id: `%${predecessorAccountId}%`,
      })
      .getOne();
  }

  async findAccountByReceiptId(receiptId: string): Promise<Account> {
    return this.accountRepository
      .createQueryBuilder('account')
      .where('account.created_by_receipt_id = :receiptId', { receiptId })
      .getOne();
  }
}
