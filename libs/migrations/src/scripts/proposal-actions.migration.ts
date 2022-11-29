import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NearIndexerService, Transaction } from '@sputnik-v2/near-indexer';
import {
  Action,
  buildProposalAction,
  Proposal,
  ProposalService,
} from '@sputnik-v2/proposal';
import { btoaJSON } from '@sputnik-v2/utils';
import PromisePool from '@supercharge/promise-pool';
import Decimal from 'decimal.js';
import { Migration } from '..';

@Injectable()
export class ProposalActionsMigration implements Migration {
  private readonly logger = new Logger(ProposalActionsMigration.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly proposalService: ProposalService,
    private readonly nearIndexerService: NearIndexerService,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Proposal Actions migration...');

    const { contractName } = this.configService.get('near');

    this.logger.log('Retrieving Proposals...');
    const allProposals: Proposal[] = await this.proposalService.find();
    this.logger.log(`Retrieved ${allProposals.length} Proposals.`);

    const { blockTimestamp = 0 } =
      await this.nearIndexerService.firstTransaction();
    this.logger.log(
      `First available indexer transaction timestamp: ${blockTimestamp}`,
    );

    const { blockTimestamp: nearBlockTimestamp } =
      await this.nearIndexerService.lastTransaction();
    this.logger.log(
      `Last available indexer transaction timestamp: ${nearBlockTimestamp}`,
    );

    const chunkSize = 7 * 24 * 60 * 60 * 1000 * 1000 * 1000; // a week
    const chunks: { from: string; to: string }[] = [];

    let from = new Decimal(blockTimestamp);

    while (true) {
      const to = Decimal.min(Decimal.sum(from, chunkSize), nearBlockTimestamp);

      chunks.push({ from: from.toString(), to: to.toString() });

      if (to.gte(nearBlockTimestamp)) {
        break;
      }

      from = to;
    }

    this.logger.log(`Querying for Near Indexer Transactions...`);
    const { results: transactions, errors: txErrors } =
      await PromisePool.withConcurrency(2)
        .for(chunks)
        .process(async ({ from, to }) => {
          return this.nearIndexerService.findTransactionsByAccountIds(
            contractName,
            from,
            to,
          );
        });

    this.logger.log(
      `Received Total Transactions: ${transactions.length}. Errors count: ${txErrors.length}`,
    );

    if (txErrors && txErrors.length) {
      txErrors.map((error) => this.logger.error(error));
    }

    this.logger.log(`Migrating Proposals...`);
    const migratedProposals = this.migrateProposals(
      allProposals,
      transactions.flat(),
    );

    this.logger.log(`Updating migrated Proposals...`);
    const { results, errors: proposalErrors } =
      await PromisePool.withConcurrency(500)
        .for(migratedProposals)
        .process(
          async (proposal) => await this.proposalService.update(proposal),
        );

    this.logger.log(
      `Successfully updated Proposals: ${results.flat().length}. Errors: ${
        proposalErrors.length
      }`,
    );

    if (proposalErrors && proposalErrors.length) {
      proposalErrors.map((error) => this.logger.error(error));
    }

    this.logger.log('Proposal Actions migration finished.');
  }

  private migrateProposals(
    proposals: Proposal[],
    transactions: Transaction[],
  ): Proposal[] {
    const transactionsByAccountId =
      this.reduceTransactionsByAccountId(transactions);

    return proposals.map((proposal) => {
      const { daoId, proposalId } = proposal;
      if (!transactionsByAccountId[daoId]) {
        return proposal;
      }

      const preFilteredTransactions = transactionsByAccountId[daoId].filter(
        (tx) => tx.transactionAction.args.args_base64,
      );

      const voteActions = preFilteredTransactions
        .filter(
          ({ transactionAction }) =>
            (transactionAction.args as any).method_name == 'act_proposal',
        )
        .filter((tx) => {
          const { id } =
            btoaJSON(tx.transactionAction.args.args_base64 as string) || {};
          return id === proposalId;
        })
        .map(
          ({
            transactionAction,
            signerAccountId: accountId,
            transactionHash,
            blockTimestamp,
          }) => {
            const action = btoaJSON(
              transactionAction.args.args_base64 as string,
            )?.action;

            return buildProposalAction(
              proposal.id,
              { accountId, transactionHash, blockTimestamp },
              action,
            );
          },
        );

      const prop = {
        ...proposal,
        actions: [
          buildProposalAction(
            proposal.id,
            {
              transactionHash: proposal.transactionHash,
              blockTimestamp: proposal.createTimestamp,
              accountId: proposal.proposer,
            },
            Action.AddProposal,
          ),
          ...voteActions,
        ],
      } as Proposal;

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
