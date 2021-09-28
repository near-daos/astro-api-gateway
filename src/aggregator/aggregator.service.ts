import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from 'src/daos/dao.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { ProposalService } from 'src/proposals/proposal.service';
import { isNotNull } from 'src/utils/guards';
import { NearService } from 'src/near/near.service';
import { TransactionService } from 'src/transactions/transaction.service';
import { ConfigService } from '@nestjs/config';
import { Transaction, Account, ActionReceiptAction } from 'src/near';
import { SputnikDaoDto } from 'src/daos/dto/dao-sputnik.dto';
import { castProposalKind, ProposalDto } from 'src/proposals/dto/proposal.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { buildDaoId, buildProposalId } from 'src/utils';
import { EventService } from 'src/events/events.service';
import { DaoStatus } from 'src/daos/types/dao-status';
import { BountyService } from 'src/bounties/bounty.service';
import { TokenFactoryService } from 'src/token-factory/token-factory.service';
import { TokenDto } from 'src/tokens/dto/token.dto';
import { TokenService } from 'src/tokens/token.service';
import { BountyDto } from 'src/bounties/dto/bounty.dto';
import { ProposalKindAddBounty } from 'src/proposals/dto/proposal-kind.dto';
import { ProposalType } from 'src/proposals/types/proposal-type';
import { NFTTokenService } from 'src/tokens/nft-token.service';
import { NFTTokenDto } from 'src/tokens/dto/nft-token.dto';
import { AggregationState, AggregationStatus } from './types/aggregation-state';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  private aggregationState: AggregationState = new AggregationState(null);

  constructor(
    private readonly configService: ConfigService,
    private readonly sputnikDaoService: SputnikDaoService,
    private readonly tokenFactoryService: TokenFactoryService,
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
    private readonly nearService: NearService,
    private readonly transactionService: TransactionService,
    private readonly eventService: EventService,
    private readonly bountyService: BountyService,
    private readonly tokenService: TokenService,
    private readonly nftTokenService: NFTTokenService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    const { pollingInterval } = this.configService.get('aggregator');

    const interval = setInterval(
      () => this.scheduleAggregation(),
      pollingInterval,
    );
    schedulerRegistry.addInterval('polling', interval);
  }

  public async scheduleAggregation(): Promise<void> {
    const tx = await this.transactionService.lastTransaction();
    if (!tx) {
      // Skipping cron job scheduling until the very 1st aggregation completes.
      return;
    }

    return this.aggregate(tx);
  }

  public async aggregate(lastTx?: Transaction): Promise<void> {
    const { contractName, tokenFactoryContractName } =
      this.configService.get('near');

    this.logger.log('Scheduling Data Aggregation...');

    this.logger.log('Collecting DAO IDs...');
    const daoIds = await this.sputnikDaoService.getDaoIds();

    this.logger.log('Checking data relevance...');

    const tx = lastTx || (await this.transactionService.lastTransaction());

    // Last transaction from NEAR Indexer - for the list of DAOs defined
    const nearTx =
      await this.nearService.findLastTransactionByReceiverAccountIds(
        [...daoIds, contractName, tokenFactoryContractName],
        tx?.blockTimestamp,
      );

    if (tx && tx.transactionHash === nearTx?.transactionHash) {
      return this.logger.log('Data is up to date. Skipping data aggregation.');
    }

    if (this.isAggregationInProgress(nearTx?.transactionHash)) {
      return this.logger.log(
        `Aggregation for transaction ${nearTx?.transactionHash} is already in progress.`,
      );
    }

    this.logger.log('Aggregating data...');
    this.aggregationState = new AggregationState(nearTx?.transactionHash);

    let startTime = new Date().getTime();
    const accounts: Account[] =
      await this.nearService.findAccountsByContractName(contractName);

    const accountsTime = new Date().getTime();
    this.logger.log(`Accounts retrieval time: ${accountsTime - startTime} ms`);

    let accountDaoIds = daoIds;
    let proposalDaoIds = daoIds;
    let tokenIds = null;

    startTime = new Date().getTime();
    const transactions: Transaction[] =
      await this.nearService.findTransactionsByReceiverAccountIds(
        [...daoIds, contractName, tokenFactoryContractName],
        tx?.blockTimestamp,
      );

    const transactionsTime = new Date().getTime();
    this.logger.log(
      `Transactions retrieval time: ${transactionsTime - startTime} ms`,
    );

    const actionTransactions = transactions.filter(
      (tx) => tx.transactionAction.args.args_json,
    );

    startTime = new Date().getTime();
    const nftActionReceipts =
      await this.nearService.findNFTActionReceiptsByReceiverAccountIds(
        [...daoIds, contractName, tokenFactoryContractName],
        tx?.blockTimestamp,
      );

    const nftTime = new Date().getTime();
    this.logger.log(`NFTs retrieval time: ${nftTime - startTime} ms`);

    const nftTokenOwners = [];
    nftActionReceipts
      .filter(({ args }) => (args?.args_json as any)?.receiver_id)
      .map(({ receiptReceiverAccountId, args }) => {
        const receiverId = (args.args_json as any).receiver_id;
        if (
          nftTokenOwners.some(
            ({ contractId, accountId }) =>
              contractId === receiptReceiverAccountId &&
              accountId === receiverId,
          )
        ) {
          return;
        }

        nftTokenOwners.push({
          contractId: receiptReceiverAccountId,
          accountId: (args.args_json as any).receiver_id,
        });
      });

    // TODO: check token re-indexing condition - get delta

    if (tx) {
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
      const proposalTransactions = actionTransactions
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

      const transactionsByAccountId =
        this.reduceTransactionsByAccountId(actionTransactions);

      const tokenFactoryTransactions =
        transactionsByAccountId[tokenFactoryContractName] || [];

      const tokenTransactions = tokenFactoryTransactions.filter(
        ({ transactionAction }) => {
          const { method_name, args_json } = transactionAction.args;
          const { metadata } = (args_json as any)?.args || {};

          return method_name == 'create_token' && metadata;
        },
      );

      tokenIds = [
        ...new Set(
          tokenTransactions.map((tx) => {
            const { symbol } = (tx.transactionAction.args.args_json as any)
              ?.args?.metadata;

            return symbol;
          }),
        ),
      ];

      if (accountDaoIds.length) {
        this.logger.log(`New DAOs created: ${accountDaoIds.join(',')}`);

        this.eventService.sendDaoUpdateNotificationEvent(accountDaoIds);
      }

      if (proposalDaoIds.length) {
        this.logger.log(
          `Proposals updated for DAOs: ${proposalDaoIds.join(',')}`,
        );
        await this.eventService.sendDaoUpdateNotificationEvent(proposalDaoIds);
      }
    }

    const bountyClaimTransactions =
      await this.transactionService.findBountyClaimTransactions();
    const bountyClaimAccountIds = [
      ...new Set(
        [...bountyClaimTransactions, ...actionTransactions]
          .filter(
            ({ transactionAction: action }) =>
              'bounty_claim' === (action.args as any).method_name,
          )
          .map(({ signerAccountId }) => signerAccountId),
      ),
    ];

    startTime = new Date().getTime();
    const [daos, proposals, bounties, tokens, nftTokens] = await Promise.all([
      this.sputnikDaoService.getDaoList(
        Array.from(new Set([...accountDaoIds, ...proposalDaoIds])),
      ),
      this.sputnikDaoService.getProposals(proposalDaoIds),
      this.sputnikDaoService.getBounties(proposalDaoIds, bountyClaimAccountIds),
      this.tokenFactoryService.getTokens(tokenIds),
      this.tokenFactoryService.getNFTs(nftTokenOwners),
    ]);
    const aggregationTime = new Date().getTime();
    this.logger.log(
      `Smart Contract aggregation time: ${aggregationTime - startTime} ms`,
    );

    const enrichedDaos = this.enrichDaos(daos, accounts, transactions);
    const enrichedDaoIds = enrichedDaos.map(({ id }) => id);

    this.logger.log('Persisting aggregated DAOs...');
    await Promise.all(
      enrichedDaos
        .filter((dao) => isNotNull(dao))
        .map((dao) => this.daoService.create(dao)),
    );
    this.logger.log('Finished DAO aggregation.');

    if (tx) {
      this.logger.log('Sending DAO updates...');
      this.eventService.sendDaoUpdates(daos);
      this.logger.log('Sent DAO updates succesfully.');
    }

    //Q2: Proposals with the absent DAO references?
    //Filtering proposals for unavailable DAOs
    const filteredProposals = !tx
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

    if (tx) {
      this.logger.log('Sending Proposal updates...');
      this.eventService.sendProposalUpdates(filteredProposals);
      this.logger.log('Sent Proposal updates succesfully.');
    }

    const filteredBounties = !tx
      ? bounties.filter(({ daoId }) => enrichedDaoIds.includes(daoId))
      : bounties;

    const enrichedBounties = this.enrichBounties(
      filteredBounties,
      transactions,
    );

    this.logger.log('Persisting aggregated Bounties...');
    await Promise.all(
      enrichedBounties.map((bounty) => this.bountyService.create(bounty)),
    );
    this.logger.log('Finished Bounties aggregation.');

    const enrichedTokens = this.enrichTokens(
      tokens,
      transactions,
      tokenFactoryContractName,
    );

    this.logger.log('Persisting aggregated Tokens...');
    await Promise.all(
      enrichedTokens.map((token) => this.tokenService.create(token)),
    );
    this.logger.log('Finished Tokens aggregation.');

    const enrichedNFTTokens = this.enrichNFTTokens(
      nftTokens,
      nftActionReceipts,
    );

    this.logger.log('Persisting aggregated NFT Tokens...');
    await Promise.all(
      enrichedNFTTokens.map((token) => this.nftTokenService.create(token)),
    );
    this.logger.log('Finished NFT Tokens aggregation.');

    this.logger.log('Persisting aggregated Transactions...');
    await Promise.all(
      transactions.map((transaction) =>
        this.transactionService.create(transaction),
      ),
    );
    this.logger.log('Finished Transactions aggregation.');

    this.aggregationState.status = AggregationStatus.Success;
  }

  private enrichDaos(
    daos: SputnikDaoDto[],
    accounts: Account[],
    transactions: Transaction[],
  ): SputnikDaoDto[] {
    const daoTxDataMap = accounts.reduce(
      (acc, { accountId, receipt }) => ({
        ...acc,
        [accountId]: {
          transactionHash: receipt.originatedFromTransactionHash,
          blockTimestamp: receipt.includedInBlockTimestamp,
          signerAccountId: receipt.originatedFromTransaction?.signerAccountId,
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
        createTimestamp: txData?.blockTimestamp,
        updateTransactionHash: (txUpdateData || txData)?.transactionHash,
        updateTimestamp: (txUpdateData || txData)?.blockTimestamp,
        numberOfAssociates: new Set(signersByAccountId[dao.id]).size,
        status: DaoStatus.Success,
        createdBy: txData?.signerAccountId,
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
      const { id, daoId, description, kind, proposer } = proposal;
      if (!transactionsByAccountId[daoId]) {
        return proposal;
      }

      const preFilteredTransactions = transactionsByAccountId[daoId].filter(
        (tx) => tx.transactionAction.args.args_json,
      );

      const txData = preFilteredTransactions
        .filter(
          ({ transactionAction }) =>
            (transactionAction.args as any).method_name == 'add_proposal',
        )
        .find((tx) => {
          const { signerAccountId } = tx;

          const { description: txDescription, kind: txKind } =
            (tx.transactionAction.args.args_json as any).proposal || {};
          return (
            description === txDescription &&
            kind.equals(castProposalKind(txKind)) &&
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

  private enrichBounties(bounties: BountyDto[], transactions: Transaction[]) {
    const transactionsByAccountId =
      this.reduceTransactionsByAccountId(transactions);

    return bounties.map((bounty) => {
      const { daoId, amount, description, maxDeadline, times, token } = bounty;
      if (!transactionsByAccountId[daoId]) {
        return bounty;
      }

      const preFilteredTransactions = transactionsByAccountId[daoId].filter(
        (tx) => tx.transactionAction.args.args_json,
      );

      const txData = preFilteredTransactions
        .filter(
          ({ transactionAction }) =>
            (transactionAction.args as any).method_name == 'add_proposal',
        )
        .filter((tx) => {
          const { kind: txKind } =
            (tx.transactionAction.args.args_json as any).proposal || {};

          const txProposalKind = castProposalKind(txKind);
          const { type } = txProposalKind?.kind;
          if (ProposalType.AddBounty !== type) {
            return false;
          }

          const {
            amount: txAmount,
            description: txDescription,
            times: txTimes,
            maxDeadline: txMaxDeadline,
            token: txToken,
          } = (txProposalKind.kind as ProposalKindAddBounty)?.bounty || {};

          return (
            amount === txAmount &&
            description === txDescription &&
            times === txTimes &&
            maxDeadline === txMaxDeadline &&
            token === txToken
          );
        });

      const txCreateData = txData[0];
      const txUpdateData = txData[txData.length - 1];

      const bountyClaimTransactions = preFilteredTransactions.filter(
        ({ transactionAction }) =>
          (transactionAction.args as any).method_name == 'bounty_claim',
      );

      const bountyClaims = bounty.bountyClaims.map((bountyClaim) => {
        const { bounty, deadline, accountId } = bountyClaim;
        const txCreateData = bountyClaimTransactions.find((tx) => {
          const { signerAccountId } = tx;
          const { id: txId, deadline: txDeadline } = tx.transactionAction.args
            .args_json as any;

          return (
            signerAccountId === accountId &&
            bounty?.bountyId === txId &&
            deadline === txDeadline
          );
        });

        const enrichedBountyClaim = {
          ...bountyClaim,
          transactionHash: txCreateData?.transactionHash,
          createTimestamp: txCreateData?.blockTimestamp,
        };

        return enrichedBountyClaim;
      });

      const enrichedBounty = {
        ...bounty,
        bountyClaims,
        transactionHash: txCreateData?.transactionHash,
        createTimestamp: txCreateData?.blockTimestamp,
        updateTransactionHash: (txUpdateData || txCreateData)?.transactionHash,
        updateTimestamp: (txUpdateData || txCreateData)?.blockTimestamp,
      };

      return enrichedBounty;
    });
  }

  private enrichTokens(
    tokens: TokenDto[],
    transactions: Transaction[],
    tokenFactoryContractName: string,
  ): TokenDto[] {
    const transactionsByAccountId =
      this.reduceTransactionsByAccountId(transactions);

    const tokenFactoryTransactions =
      transactionsByAccountId[tokenFactoryContractName];

    if (!tokenFactoryTransactions || !tokenFactoryTransactions.length) {
      return tokens;
    }

    const preFilteredTransactions = tokenFactoryTransactions.filter(
      (tx) => tx.transactionAction.args.args_json,
    );

    return tokens.map((token) => {
      const { symbol } = token.metadata;

      const txData = preFilteredTransactions
        .filter(
          ({ transactionAction }) =>
            (transactionAction.args as any).method_name == 'create_token',
        )
        .find((tx) => {
          const { symbol: txSymbol } =
            (tx.transactionAction.args.args_json as any)?.args?.metadata || {};

          return symbol === txSymbol;
        });

      const enrichedToken = {
        ...token,
        transactionHash: txData?.transactionHash,
        createTimestamp: txData?.blockTimestamp,
      };

      return enrichedToken;
    });
  }

  private enrichNFTTokens(
    tokens: NFTTokenDto[],
    nftActionReceipts: ActionReceiptAction[],
  ): NFTTokenDto[] {
    return tokens.map((token) => {
      const { id, ownerId, tokenId } = token;

      const actionReceipt = nftActionReceipts.find((receiptAction) => {
        const { receiver_id, token_series_id } =
          (receiptAction.args?.args_json as any) || {};

        return (
          ownerId === receiver_id && (id || tokenId)?.includes(token_series_id)
        );
      });

      return {
        ...token,
        transactionHash: actionReceipt?.transaction?.transactionHash,
        createTimestamp: actionReceipt?.transaction?.blockTimestamp,
      };
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

  private isAggregationInProgress(transactionHash: string): boolean {
    const { status, transactionHash: txHash } = this.aggregationState;

    if (
      AggregationStatus.Success !== status &&
      this.aggregationState.isExpired()
    ) {
      return false;
    }

    return transactionHash === txHash;
  }
}
