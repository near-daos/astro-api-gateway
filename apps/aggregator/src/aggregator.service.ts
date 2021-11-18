import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  DaoService,
  SputnikDaoDto,
  DaoDto,
  RoleKindType,
} from '@sputnik-v2/dao';
import { SputnikDaoService } from '@sputnik-v2/sputnikdao';
import {
  ProposalService,
  castProposalKind,
  ProposalDto,
  ProposalKindAddBounty,
  ProposalType,
  Action,
  buildProposalAction,
} from '@sputnik-v2/proposal';
import {
  NearIndexerService,
  Account,
  ActionReceiptAction,
  Receipt,
  Transaction,
} from '@sputnik-v2/near-indexer';
import { TransactionService } from '@sputnik-v2/transaction';
import {
  isNotNull,
  btoaJSON,
  buildDaoId,
  buildProposalId,
  calcProposalVotePeriodEnd,
} from '@sputnik-v2/utils';
import { EventService } from '@sputnik-v2/event';
import { BountyService, BountyDto } from '@sputnik-v2/bounty';
import {
  TokenFactoryService,
  TokenDto,
  TokenService,
  NFTTokenService,
  NFTTokenDto,
} from '@sputnik-v2/token';

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
    private readonly nearIndexerService: NearIndexerService,
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

    this.logger.debug('Scheduling Data Aggregation...');

    this.logger.debug('Checking data relevance...');

    const tx = lastTx || (await this.transactionService.lastTransaction());

    // Last transaction from NEAR Indexer - for the list of DAOs defined
    const nearTx =
      await this.nearIndexerService.findLastTransactionByContractName(
        contractName,
        tx?.blockTimestamp,
      );

    if (tx && tx.transactionHash === nearTx?.transactionHash) {
      return this.logger.debug(
        'Data is up to date. Skipping data aggregation.',
      );
    }

    if (this.isAggregationInProgress(nearTx?.transactionHash)) {
      return this.logger.debug(
        `Aggregation for transaction ${nearTx?.transactionHash} is already in progress.`,
      );
    }

    this.logger.log('Aggregating data...');
    this.aggregationState = new AggregationState(nearTx?.transactionHash);

    let startTime = new Date().getTime();
    const transactions: Transaction[] =
      await this.nearIndexerService.findTransactionsByContractName(
        contractName,
        tx?.blockTimestamp,
      );

    const transactionsTime = new Date().getTime();
    this.logger.log(
      `Transactions retrieval time: ${transactionsTime - startTime} ms`,
    );

    let accountDaoIds = [
      ...new Set(
        transactions.map(({ receiverAccountId }) => receiverAccountId),
      ),
    ];
    let proposalDaoIds = accountDaoIds;
    let tokenIds = null;

    const actionTransactions = transactions.filter(
      (tx) => tx.transactionAction?.args?.args_base64,
    );

    if (tx) {
      accountDaoIds = [
        ...new Set(
          transactions
            .filter(
              ({ transactionAction: action }) =>
                action.args?.args_base64 &&
                btoaJSON(action.args?.args_base64 as string)?.name,
            )
            .filter(
              ({ receiverAccountId: accId, transactionAction: action }) =>
                accId === contractName &&
                (action.args as any).method_name === 'create',
            )
            .map(({ transactionAction: action }) =>
              buildDaoId(
                btoaJSON(action.args?.args_base64 as string)?.name,
                contractName,
              ),
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
            btoaJSON(action.args?.args_base64 as string)?.id,
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
          const { method_name, args_base64 } = transactionAction.args;
          const { metadata } = btoaJSON(args_base64 as string)?.args || {};

          return method_name == 'create_token' && metadata;
        },
      );

      tokenIds = [
        ...new Set(
          tokenTransactions.map((tx) => {
            const { symbol } = btoaJSON(
              tx.transactionAction.args.args_base64 as string,
            )?.args?.metadata;

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

    startTime = new Date().getTime();
    const accountsCombinedDaoIds = Array.from(
      new Set([...accountDaoIds, ...proposalDaoIds]),
    );
    const accounts: Account[] = tx
      ? accountsCombinedDaoIds?.length
        ? await this.nearIndexerService.findAccountsByAccountIds(
            accountsCombinedDaoIds,
          )
        : []
      : await this.nearIndexerService.findAccountsByContractName(contractName);

    const accountsTime = new Date().getTime();
    this.logger.log(`Accounts retrieval time: ${accountsTime - startTime} ms`);

    startTime = new Date().getTime();
    const nftActionReceipts =
      await this.nearIndexerService.findNFTActionReceiptsByReceiverAccountIds(
        [...accountDaoIds, contractName, tokenFactoryContractName],
        tx?.blockTimestamp,
      );

    const nftTime = new Date().getTime();
    this.logger.log(`NFTs retrieval time: ${nftTime - startTime} ms`);

    const nftTokenOwners = [];
    nftActionReceipts
      .filter(({ args }) => btoaJSON(args?.args_base64 as string)?.receiver_id)
      .map(({ receiptReceiverAccountId, args }) => {
        const receiverId = btoaJSON(args.args_base64 as string)?.receiver_id;
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
          accountId: btoaJSON(args.args_base64 as string)?.receiver_id,
        });
      });

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
      this.sputnikDaoService.getDaoList(accountsCombinedDaoIds),
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

    let enrichedProposals = this.enrichProposals(
      filteredProposals,
      transactions,
      null,
      daos,
    );

    // working around transaction info population for some legacy proposals
    const missingProposalDaoIds = enrichedProposals
      .filter(({ transactionHash }) => !transactionHash)
      .map(({ daoId }) => daoId);

    let receipts: Receipt[] = [];
    try {
      receipts = missingProposalDaoIds.length
        ? await this.nearIndexerService.findReceiptsByReceiverAccountIds(
            [...Array.from(new Set(missingProposalDaoIds)), contractName],
            tx?.blockTimestamp,
          )
        : [];
    } catch (e) {
      this.logger.error(e);
    }

    enrichedProposals = receipts.length
      ? this.enrichProposals(filteredProposals, transactions, receipts, daos)
      : enrichedProposals;

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

    await this.purgeRemovedProposals(filteredProposals, enrichedDaos);

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
          transactionHash: receipt.originatedFromTransaction.transactionHash,
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
      const numberOfMembers = dao.policy.roles
        .filter((role) => role.kind === RoleKindType.Group)
        .map((group) => group.accountIds)
        .flat().length;

      return {
        ...dao,
        transactionHash: txData?.transactionHash,
        createTimestamp: txData?.blockTimestamp,
        updateTransactionHash: (txUpdateData || txData)?.transactionHash,
        updateTimestamp: (txUpdateData || txData)?.blockTimestamp,
        numberOfAssociates: new Set(signersByAccountId[dao.id]).size,
        numberOfMembers,
        createdBy: txData?.signerAccountId,
      };
    });
  }

  private enrichProposals(
    proposals: ProposalDto[],
    transactions: Transaction[],
    receipts?: Receipt[],
    daos?: DaoDto[],
  ): ProposalDto[] {
    const transactionsByAccountId =
      this.reduceTransactionsByAccountId(transactions);

    return proposals.map((proposal) => {
      const { id, daoId, description, kind, proposer, proposalId } = proposal;
      if (!transactionsByAccountId[daoId]) {
        return proposal;
      }

      const dao = daos.find(({ id }) => id === daoId);

      const preFilteredTransactions = transactionsByAccountId[daoId].filter(
        (tx) => tx.transactionAction.args.args_base64,
      );

      let txData = preFilteredTransactions
        .filter(
          ({ transactionAction }) =>
            (transactionAction.args as any).method_name == 'add_proposal',
        )
        .find((tx) => {
          const { signerAccountId } = tx;

          const { description: txDescription, kind: txKind } =
            btoaJSON(tx.transactionAction.args.args_base64 as string)
              ?.proposal || {};
          return (
            description === txDescription &&
            kind.equals(castProposalKind(txKind)) &&
            signerAccountId === proposer
          );
        });

      if (!txData && receipts) {
        const receipt = receipts
          .filter(
            (receipt) =>
              receipt.receiverAccountId === daoId &&
              receipt.predecessorAccountId === proposer,
          )
          .find(({ receiptActions }) => {
            return receiptActions.find((receiptAction) => {
              const { description: receiptDescription, kind: receiptKind } =
                btoaJSON(receiptAction?.args?.args_base64 as string)
                  ?.proposal || {};

              return (
                description === receiptDescription &&
                kind.equals(castProposalKind(receiptKind))
              );
            });
          });

        txData = {
          transactionHash: receipt?.originatedFromTransactionHash,
          blockTimestamp: receipt?.includedInBlockTimestamp,
        } as any;
      }

      const txUpdateData = preFilteredTransactions
        .filter(
          (tx) =>
            btoaJSON(tx.transactionAction.args.args_base64 as string)?.id ===
            id,
        )
        .pop();

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
              proposal,
              { accountId, transactionHash, blockTimestamp },
              action,
            );
          },
        );

      const prop = {
        ...proposal,
        transactionHash: txData?.transactionHash,
        createTimestamp: txData?.blockTimestamp,
        updateTransactionHash: (txUpdateData || txData)?.transactionHash,
        updateTimestamp: (txUpdateData || txData)?.blockTimestamp,
        votePeriodEnd: calcProposalVotePeriodEnd(proposal, dao),
        actions: [
          buildProposalAction(
            proposal,
            {
              ...txData,
              accountId: proposal.proposer,
            },
            Action.AddProposal,
          ),
          ...voteActions,
        ],
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
        (tx) => tx.transactionAction.args.args_base64,
      );

      const txData = preFilteredTransactions
        .filter(
          ({ transactionAction }) =>
            (transactionAction.args as any).method_name == 'add_proposal',
        )
        .filter((tx) => {
          const { kind: txKind } =
            btoaJSON(tx.transactionAction.args.args_base64 as string)
              ?.proposal || {};

          const txProposalKind = castProposalKind(txKind);
          const { type } = txProposalKind?.kind || {};
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
          const { id: txId, deadline: txDeadline } =
            btoaJSON(tx.transactionAction.args.args_base64 as string) || {};

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
      (tx) => tx.transactionAction.args.args_base64,
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
            btoaJSON(tx.transactionAction.args.args_base64 as string)?.args
              ?.metadata || {};

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
          btoaJSON(receiptAction.args?.args_base64 as string) || {};

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

  private async purgeRemovedProposals(
    proposals: ProposalDto[],
    enrichedDaos: SputnikDaoDto[],
  ): Promise<void> {
    try {
      const proposalIdsByDao = proposals.reduce((acc, cur) => {
        return {
          ...acc,
          [cur.daoId]: [...(acc[cur.daoId] || []), cur.proposalId],
        };
      }, {});
      const removedProposals = [];

      Object.keys(proposalIdsByDao).map((daoId) => {
        const daoProposalIds = proposalIdsByDao[daoId];
        const dao = enrichedDaos.find(({ id }) => daoId === id);

        for (let i = 0; i < dao.lastProposalId; i++) {
          if (!daoProposalIds.includes(i)) {
            removedProposals.push(buildProposalId(daoId, i));
          }
        }
      });

      if (!removedProposals.length) {
        return;
      }

      this.logger.log(`Found removed Proposals: ${removedProposals}`);

      this.logger.log('Purging aggregated Proposals considered as removed...');
      await Promise.all(
        removedProposals.map((id) => this.proposalService.remove(id)),
      );
      this.logger.log('Successfully purged removed Proposals.');
    } catch (e) {
      this.logger.error(e);
    }
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
