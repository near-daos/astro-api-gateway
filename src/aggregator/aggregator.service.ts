import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from 'src/daos/dao.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { ProposalService } from 'src/proposals/proposal.service';
import { isNotNull } from 'src/utils/guards';
import { NearService } from 'src/near/near.service';
import { TransactionService } from 'src/transactions/transaction.service';
import { ConfigService } from '@nestjs/config';
import { Transaction, Account } from 'src/near';
import { DaoDto } from 'src/daos/dto/dao.dto';
import { ProposalDto } from 'src/proposals/dto/proposal.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { buildDaoId, buildProposalId } from 'src/utils';
import { EventService } from 'src/events/events.service';
import { DaoStatus } from 'src/daos/types/dao-status';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sputnikDaoService: SputnikDaoService,
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
    private readonly nearService: NearService,
    private readonly transactionService: TransactionService,
    private readonly eventService: EventService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async aggregate(): Promise<void> {
    const { contractName } = this.configService.get('near');

    this.logger.log('Scheduling Data Aggregation...');

    this.logger.log('Collecting DAO IDs...');
    const daoIds = await this.sputnikDaoService.getDaoIds();

    this.logger.log('Checking data relevance...');

    const aggregatedTxCount = await this.transactionService.count();

    const [tx, nearTx] = await Promise.all([
      this.transactionService.lastTransaction(),
      this.nearService.lastTransaction([...daoIds, contractName]),
    ]);

    if (
      aggregatedTxCount &&
      tx &&
      nearTx &&
      tx.transactionHash === nearTx.transactionHash
    ) {
      return this.logger.log('Data is up to date. Skipping data aggregation.');
    }

    const { blockTimestamp } = tx || {};

    const accounts: Account[] =
      await this.nearService.findAccountsByContractName(contractName);
    const transactions: Transaction[] =
      await this.nearService.findTransactionsByReceiverAccountIds(
        [...daoIds, contractName],
        blockTimestamp,
      );

    let accountDaoIds = daoIds;
    let proposalDaoIds = daoIds;

    if (aggregatedTxCount) {
      accountDaoIds = [
        ...new Set(
          transactions
            //TODO: Q1: args_json is absent? - needs clarification
            .filter(
              ({ transactionAction: action }) =>
                action.args?.args_json && (action.args?.args_json as any)?.name,
            )
            .filter(
              ({ receiverAccountId: accId, transactionAction: action }) =>
                accId === contractName &&
                (action.args as any).method_name === 'create',
            )
            .map(({ transactionAction: action }) =>
              buildDaoId((action.args as any).args_json.name, contractName),
            ),
        ),
      ];

      //TODO: Re-work this for cases when proposal is created - there is no 'id' in transaction action payload
      const proposalTransactions = transactions
        .filter(
          ({ transactionAction: action }) => (action.args as any).args_json,
        )
        .filter(({ receiverAccountId }) => receiverAccountId !== contractName)
        .map(({ receiverAccountId, transactionAction: action }) => ({
          receiverAccountId,
          function: (action.args as any).method_name,
          id: buildProposalId(
            receiverAccountId,
            (action.args as any).args_json.id,
          ),
        }));

      proposalDaoIds = [
        ...new Set(
          proposalTransactions.map(
            ({ receiverAccountId }) => receiverAccountId,
          ),
        ),
      ];

      if (proposalTransactions.length) {
        this.logger.log(
          `Proposals updated for DAOs: ${proposalDaoIds.join(',')}`,
        );
        await this.eventService.handleDaoUpdates(proposalDaoIds);
      }
    }

    this.logger.log('Aggregating data...');
    const [daos, proposals] = await Promise.all([
      this.sputnikDaoService.getDaoList(accountDaoIds),
      this.sputnikDaoService.getProposals(proposalDaoIds),
    ]);

    const enrichedDaos = this.enrichDaos(daos, accounts, transactions);
    const enrichedDaoIds = enrichedDaos.map(({ id }) => id);

    this.logger.log('Persisting aggregated DAOs...');
    await Promise.all(
      enrichedDaos
        .filter((dao) => isNotNull(dao))
        .map((dao) => this.daoService.create(dao)),
    );
    this.logger.log('Finished DAO aggregation.');

    //Q2: Proposals with the absent DAO references?
    //Filtering proposals for unavailable DAOs
    const filteredProposals = !aggregatedTxCount
      ? proposals.filter(({ daoId }) => enrichedDaoIds.includes(daoId))
      : proposals;

    const enrichedProposals = this.enrichProposals(
      filteredProposals,
      transactions,
    );

    this.logger.log('Persisting aggregated Proposals...');
    await Promise.all(
      enrichedProposals.map((proposal) =>
        this.proposalService.create(proposal),
      ),
    );
    this.logger.log('Finished Proposals aggregation.');

    this.logger.log('Persisting aggregated Transactions...');
    await Promise.all(
      transactions.map((transaction) =>
        this.transactionService.create(transaction),
      ),
    );
  }

  private enrichDaos(
    daos: DaoDto[],
    accounts: Account[],
    transactions: Transaction[],
  ): DaoDto[] {
    const daoTxDataMap = accounts.reduce(
      (acc, { accountId, receipt }) => ({
        ...acc,
        [accountId]: {
          transactionHash: receipt.originatedFromTransactionHash,
          createTimestamp: receipt.includedInBlockTimestamp,
        },
      }),
      {},
    );

    const signersByAccountId = transactions.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.receiverAccountId]: [
          ...(acc[cur.receiverAccountId] || []),
          cur.signerAccountId,
        ],
      }),
      {},
    );

    const transactionsByAccountId =
      this.reduceTransactionsByAccountId(transactions);

    return daos.map((dao) => {
      const txData = daoTxDataMap[dao.id];
      const txUpdateData = transactionsByAccountId[dao.id]?.pop();

      return {
        ...dao,
        transactionHash: txData?.transactionHash,
        createTimestamp: txData?.createTimestamp,
        updateTransactionHash: (txUpdateData || txData)?.transactionHash,
        updateTimestamp: (txUpdateData || txData)?.blockTimestamp,
        numberOfMembers: new Set(signersByAccountId[dao.id]).size,
        status: DaoStatus.Success,
      };
    });
  }

  private enrichProposals(
    proposals: ProposalDto[],
    transactions: Transaction[],
  ): ProposalDto[] {
    const transactionsByAccountId =
      this.reduceTransactionsByAccountId(transactions);

    return proposals.map((proposal) => {
      const { id, daoId, description, target, kind } = proposal;
      if (!transactionsByAccountId[daoId]) {
        return proposal;
      }

      const preFilteredTransactions = transactionsByAccountId[
        proposal.daoId
      ].filter((tx) => tx.transactionAction.args.args_json);

      const txData = preFilteredTransactions
        .filter(
          ({ transactionAction }) =>
            (transactionAction.args as any).method_name == 'add_proposal',
        )
        .find((tx) => {
          const { signerAccountId } = tx;
          const {
            description: txDescription,
            kind: txKind,
            target: txTarget,
            proposer,
          } = (tx.transactionAction.args.args_json as any).proposal;
          return (
            description === txDescription &&
            kind.type === txKind.type &&
            target === txTarget &&
            signerAccountId === proposer
          );
        });

      const txUpdateData = preFilteredTransactions
        .filter((tx) => (tx.transactionAction.args.args_json as any).id === id)
        .pop();

      const prop = {
        ...proposal,
        transactionHash: txData?.transactionHash,
        createTimestamp: txData?.blockTimestamp,
        updateTransactionHash: (txUpdateData || txData)?.transactionHash,
        updateTimestamp: (txUpdateData || txData)?.blockTimestamp,
      };

      return prop;
    });
  }

  private reduceTransactionsByAccountId(transactions: Transaction[]): {
    [key: string]: Transaction[];
  } {
    return transactions.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.receiverAccountId]: [...(acc[cur.receiverAccountId] || []), cur],
      }),
      {},
    );
  }
}
