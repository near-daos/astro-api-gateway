import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { NEAR_INDEXER_DB_CONNECTION } from '@sputnik-v2/common';
import { TokenUpdateDto } from '@sputnik-v2/token';
import {
  Connection,
  MoreThan,
  Like,
  Repository,
  SelectQueryBuilder,
  Brackets,
} from 'typeorm';
import {
  Account,
  Transaction,
  AccountChange,
  ActionReceiptAction,
  Receipt,
  AssetsNftEvent,
  LastBlock,
  Block,
} from './entities';
import { buildLikeContractName } from '@sputnik-v2/utils';
import { ExecutionOutcomeStatus } from './types';

@Injectable()
export class NearIndexerService {
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Account, NEAR_INDEXER_DB_CONNECTION)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Transaction, NEAR_INDEXER_DB_CONNECTION)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Receipt, NEAR_INDEXER_DB_CONNECTION)
    private readonly receiptRepository: Repository<Receipt>,

    @InjectRepository(ActionReceiptAction, NEAR_INDEXER_DB_CONNECTION)
    private readonly actionReceiptActionRepository: Repository<ActionReceiptAction>,

    @InjectRepository(AccountChange, NEAR_INDEXER_DB_CONNECTION)
    private readonly accountChangeRepository: Repository<AccountChange>,

    @InjectRepository(AssetsNftEvent, NEAR_INDEXER_DB_CONNECTION)
    private readonly assetsNftEventRepository: Repository<AssetsNftEvent>,

    @InjectRepository(Block, NEAR_INDEXER_DB_CONNECTION)
    private readonly blockRepository: Repository<Block>,

    @InjectRepository(LastBlock, NEAR_INDEXER_DB_CONNECTION)
    private readonly lastBlockRepository: Repository<LastBlock>,

    @InjectConnection(NEAR_INDEXER_DB_CONNECTION)
    private connection: Connection,
  ) {}

  firstTransaction(): Promise<Transaction> {
    return this.transactionRepository.findOne({
      order: { blockTimestamp: 'ASC' },
    });
  }

  lastTransaction(): Promise<Transaction> {
    return this.transactionRepository.findOne({
      order: { blockTimestamp: 'DESC' },
    });
  }

  lastNearLakeBlock(): Promise<LastBlock> {
    return this.lastBlockRepository.findOne();
  }

  findBlockByHash(blockHash: string): Promise<Block> {
    return this.blockRepository.findOne({
      blockHash,
    });
  }

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
      .leftJoinAndSelect('receipts.originatedFromTransaction', 'transactions')
      .where('account.account_id like :id', {
        id: buildLikeContractName(contractName),
      })
      .getMany();
  }

  async findAccountsByAccountIds(accountIds: string[]): Promise<Account[]> {
    return this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.receipt', 'receipts')
      .leftJoinAndSelect('receipts.originatedFromTransaction', 'transactions')
      .where('account.account_id IN (:...ids)', { ids: accountIds })
      .getMany();
  }

  async findLastAccountChangesByContractName(
    contractName: string,
    fromBlockTimestamp?: number,
  ): Promise<AccountChange> {
    return this.buildAccountChangeQuery(
      contractName,
      fromBlockTimestamp,
    ).getOne();
  }

  /** Pass either single accountId or array of accountIds */
  async findLastTransactionByAccountIds(
    accountIds: string | string[],
    fromBlockTimestamp?: number,
  ): Promise<Transaction> {
    return this.buildAggregationTransactionQuery(accountIds, fromBlockTimestamp)
      .select('transaction.transactionHash')
      .orderBy('transaction.block_timestamp', 'DESC')
      .getOne();
  }

  /** Pass either single accountId or array of accountIds */
  async findTransactionsByAccountIds(
    accountIds: string | string[],
    fromBlockTimestamp?: number,
    toBlockTimestamp?: number,
  ): Promise<Transaction[]> {
    return this.buildAggregationTransactionQuery(
      accountIds,
      fromBlockTimestamp,
      toBlockTimestamp,
    )
      .orderBy('transaction.block_timestamp', 'ASC')
      .getMany();
  }

  // Account Likely Tokens - taken from NEAR Helper Indexer middleware
  // https://github.com/near/near-contract-helper/blob/master/middleware/indexer.js
  async findLikelyTokens(accountId: string): Promise<string[]> {
    const { bridgeTokenFactoryContractName } = this.configService.get('near');

    const received = `
        select distinct receipt_receiver_account_id as receiver_account_id
        from action_receipt_actions
        where args->'args_json'->>'receiver_id' = $1
            and action_kind = 'FUNCTION_CALL'
            and args->>'args_json' is not null
            and args->>'method_name' in ('ft_transfer', 'ft_transfer_call','ft_mint')
    `;

    const mintedWithBridge = `
        select distinct receipt_receiver_account_id as receiver_account_id from (
            select args->'args_json'->>'account_id' as account_id, receipt_receiver_account_id
            from action_receipt_actions
            where action_kind = 'FUNCTION_CALL' and
                receipt_predecessor_account_id = $2 and
                args->>'method_name' = 'mint'
        ) minted_with_bridge
        where account_id = $1
    `;

    const calledByUser = `
        select distinct receipt_receiver_account_id as receiver_account_id
        from action_receipt_actions
        where receipt_predecessor_account_id = $1
            and action_kind = 'FUNCTION_CALL'
            and (args->>'method_name' like 'ft_%' or args->>'method_name' = 'storage_deposit')
    `;

    const [receivedTokens, mintedWithBridgeTokens, calledByUserTokens] =
      await Promise.all([
        this.connection.query(received, [accountId]),
        this.connection.query(mintedWithBridge, [
          accountId,
          bridgeTokenFactoryContractName,
        ]),
        this.connection.query(calledByUser, [accountId]),
      ]);

    return [
      ...new Set(
        [
          ...receivedTokens,
          ...mintedWithBridgeTokens,
          ...calledByUserTokens,
        ].map(({ receiver_account_id }) => receiver_account_id),
      ),
    ];
  }

  async findLikelyTokenUpdates(
    contractName: string,
    fromBlockTimestamp: number,
  ): Promise<TokenUpdateDto[]> {
    const accountId = buildLikeContractName(contractName);
    const { bridgeTokenFactoryContractName } = this.configService.get('near');

    const received = `
        select distinct receipt_receiver_account_id as token, args->'args_json'->>'receiver_id' as account, receipt_included_in_block_timestamp as timestamp
        from action_receipt_actions
        where args->'args_json'->>'receiver_id' like $1
            and action_kind = 'FUNCTION_CALL'
            and args->>'args_json' is not null
            and args->>'method_name' in ('ft_transfer', 'ft_transfer_call','ft_mint')
            and receipt_included_in_block_timestamp > $2
    `;

    const mintedWithBridge = `
        select distinct receipt_receiver_account_id as token, account_id as account, receipt_included_in_block_timestamp as timestamp from (
            select args->'args_json'->>'account_id' as account_id, receipt_receiver_account_id, receipt_included_in_block_timestamp
            from action_receipt_actions
            where action_kind = 'FUNCTION_CALL' and
                receipt_predecessor_account_id = $2 and
                args->>'method_name' = 'mint'
            and receipt_included_in_block_timestamp > $3
        ) minted_with_bridge
        where account_id like $1
    `;

    const calledByUser = `
        select distinct receipt_receiver_account_id as token, receipt_predecessor_account_id as account, receipt_included_in_block_timestamp as timestamp
        from action_receipt_actions
        where receipt_predecessor_account_id like $1
            and action_kind = 'FUNCTION_CALL'
            and (args->>'method_name' like 'ft_%' or args->>'method_name' = 'storage_deposit')
        and receipt_included_in_block_timestamp > $2
    `;

    const [receivedTokens, mintedWithBridgeTokens, calledByUserTokens] =
      await Promise.all([
        this.connection.query(received, [accountId, fromBlockTimestamp]),
        this.connection.query(mintedWithBridge, [
          accountId,
          bridgeTokenFactoryContractName,
          fromBlockTimestamp,
        ]),
        this.connection.query(calledByUser, [accountId, fromBlockTimestamp]),
      ]);

    return [
      ...receivedTokens,
      ...mintedWithBridgeTokens,
      ...calledByUserTokens,
    ];
  }

  // Account Likely NFTs - taken from NEAR Helper Indexer middleware
  // https://github.com/near/near-contract-helper/blob/master/middleware/indexer.js
  async findLikelyNFTs(accountId: string): Promise<string[]> {
    const ownershipChangeFunctionCalls = `
        select distinct receipt_receiver_account_id as receiver_account_id
        from action_receipt_actions
        where args->'args_json'->>'receiver_id' = $1
            and action_kind = 'FUNCTION_CALL'
            and args->>'args_json' is not null
            and args->>'method_name' like 'nft_%'
    `;

    const ownershipChangeEvents = `
        select distinct emitted_by_contract_account_id as receiver_account_id 
        from assets__non_fungible_token_events
        where token_new_owner_account_id = $1
    `;

    const receivedTokens = await Promise.all([
      this.connection.query(ownershipChangeFunctionCalls, [accountId]),
      this.connection.query(ownershipChangeEvents, [accountId]),
    ]);

    return [
      ...new Set(
        receivedTokens
          .flat()
          .map(({ receiver_account_id }) => receiver_account_id),
      ),
    ];
  }

  async findNFTEvents(
    contractId: string,
    tokenId: string,
  ): Promise<AssetsNftEvent[]> {
    return this.assetsNftEventRepository
      .createQueryBuilder('nftEvent')
      .where('nftEvent.emitted_by_contract_account_id = :contractId', {
        contractId,
      })
      .andWhere('nftEvent.token_id = :tokenId', { tokenId })
      .orderBy('emitted_at_block_timestamp', 'DESC')
      .getMany();
  }

  async findNFTEventUpdates(
    contractName: string,
    fromBlockTimestamp: number,
  ): Promise<AssetsNftEvent[]> {
    // TODO optimize query, replace LIKE '%.contract.name' with IN ('1.contract.name', '2.contract.name', ...)
    const accountId = buildLikeContractName(contractName);
    return this.assetsNftEventRepository.find({
      where: [
        {
          tokenOldOwnerAccountId: Like(accountId),
          emittedAtBlockTimestamp: MoreThan(fromBlockTimestamp),
        },
        {
          tokenNewOwnerAccountId: Like(accountId),
          emittedAtBlockTimestamp: MoreThan(fromBlockTimestamp),
        },
      ],
      order: {
        emittedAtBlockTimestamp: 'DESC',
      },
    });
  }

  async receiptsByAccount(accountId: string): Promise<Receipt[]> {
    return this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.receiptActions', 'action_receipt_actions')
      .where(
        'receipt.receiver_account_id = :accountId OR receipt.predecessor_account_id = :accountId',
        {
          accountId,
        },
      )
      .orderBy('included_in_block_timestamp', 'ASC')
      .getMany();
  }

  async receiptsByAccountToken(
    accountId: string,
    tokenId: string,
  ): Promise<Receipt[]> {
    const actions = await this.actionReceiptActionRepository
      .createQueryBuilder('ara')
      .select('receipt_id')
      .andWhere(`action_kind = 'FUNCTION_CALL'`)
      .andWhere(`args->>'args_json' is not null`)
      .andWhere(`args->>'method_name' like 'ft_%'`)
      .andWhere('receipt_receiver_account_id = :tokenId', { tokenId })
      .andWhere(
        new Brackets((qb) => {
          qb.where(`args->'args_json'->>'receiver_id' = :accountId`, {
            accountId,
          });
          qb.orWhere(`receipt_predecessor_account_id = :accountId`, {
            accountId,
          });
        }),
      )
      .getRawMany();

    return actions.length > 0
      ? await this.receiptRepository
          .createQueryBuilder('receipt')
          .leftJoinAndSelect('receipt.receiptActions', 'action_receipt_actions')
          .leftJoin(
            'execution_outcomes',
            'execution_outcomes',
            'execution_outcomes.receipt_id = receipt.receipt_id',
          )
          .where('receipt.receipt_id IN (:...ids)', {
            ids: actions.map(({ receipt_id }) => receipt_id),
          })
          .andWhere('execution_outcomes.status != :failStatus', {
            failStatus: ExecutionOutcomeStatus.Failure,
          })
          .orderBy('included_in_block_timestamp', 'ASC')
          .getMany()
      : [];
  }

  private buildAggregationTransactionQuery(
    accountIds: string | string[],
    fromBlockTimestamp?: number,
    toBlockTimestamp?: number,
  ): SelectQueryBuilder<Transaction> {
    let queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect(
        'transaction.transactionAction',
        'transaction_actions',
      );
    // .leftJoinAndSelect(
    //   'transaction.receipts',
    //   'receipts',
    //   'receipts.predecessor_account_id IN (:...ids)',
    //   { ids: receiverAccountIds },
    // )
    // .leftJoinAndSelect(
    //   'receipts.receiptActions',
    //   'action_receipt_actions',
    //   'action_receipt_actions.receipt_predecessor_account_id = IN (:...ids) AND action_receipt_actions.action_kind = :actionKind',
    //   { ids: receiverAccountIds, actionKind: ActionKind.Transfer },
    // )

    queryBuilder =
      accountIds instanceof Array
        ? queryBuilder.where('transaction.receiver_account_id IN (:...ids)', {
            ids: accountIds,
          })
        : queryBuilder.where('transaction.receiver_account_id = :id', {
            id: `${accountIds}`,
          });

    queryBuilder = fromBlockTimestamp
      ? queryBuilder.andWhere('transaction.block_timestamp >= :from', {
          from: fromBlockTimestamp,
        })
      : queryBuilder;

    queryBuilder = toBlockTimestamp
      ? queryBuilder.andWhere('transaction.block_timestamp <= :to', {
          to: toBlockTimestamp,
        })
      : queryBuilder;

    return queryBuilder;
  }

  private buildAccountChangeQuery(
    contractName: string,
    fromBlockTimestamp?: number,
  ): SelectQueryBuilder<AccountChange> {
    let queryBuilder = this.accountChangeRepository
      .createQueryBuilder('account_change')
      .orderBy('account_change.changed_in_block_timestamp', 'DESC')
      .where('account_change.affected_account_id like :id', {
        id: buildLikeContractName(contractName),
      });

    queryBuilder = fromBlockTimestamp
      ? queryBuilder.andWhere(
          'account_change.changed_in_block_timestamp >= :from',
          {
            from: fromBlockTimestamp,
          },
        )
      : queryBuilder;

    return queryBuilder;
  }

  async findAccountChangeActionsByContractName(
    contractName: string,
    fromBlockTimestamp?: number,
  ): Promise<AccountChange[]> {
    return this.buildAccountChangeActionQuery(
      contractName,
      fromBlockTimestamp,
    ).getMany();
  }

  private buildAccountChangeActionQuery(
    contractName: string,
    fromBlockTimestamp?: number,
  ): SelectQueryBuilder<AccountChange> {
    return this.accountChangeRepository
      .createQueryBuilder('account_change')
      .leftJoinAndSelect('account_change.causedByReceipt', 'receipts')
      .leftJoinAndSelect('receipts.originatedFromTransaction', 'transactions')
      .leftJoinAndSelect(
        'transactions.transactionAction',
        'transaction_actions',
      )
      .leftJoinAndSelect('receipts.receiptActions', 'action_receipt_actions')
      .leftJoin(
        'execution_outcomes',
        'execution_outcomes',
        'execution_outcomes.receipt_id = receipts.receipt_id',
      )
      .where(
        new Brackets((qb) => {
          qb.where(`account_change.affected_account_id = :contractName`, {
            contractName,
          });
          qb.orWhere('account_change.affected_account_id like :id', {
            id: `%.${contractName}`,
          });
        }),
      )
      .andWhere('execution_outcomes.status != :failStatus', {
        failStatus: ExecutionOutcomeStatus.Failure,
      })
      .andWhere('transactions.block_timestamp > :from', {
        from: fromBlockTimestamp,
      })
      .orderBy('transactions.block_timestamp', 'ASC');
  }
}
