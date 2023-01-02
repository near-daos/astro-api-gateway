import { Injectable, Logger } from '@nestjs/common';
import { DaoModel, PartialEntity, ProposalModel } from '@sputnik-v2/dynamodb';
import PromisePool from '@supercharge/promise-pool';
import { ConfigService } from '@nestjs/config';

import {
  NearApiService,
  SputnikDaoConfig,
  SputnikDaoPolicy,
} from '@sputnik-v2/near-api';
import { SputnikService } from '@sputnik-v2/sputnikdao';
import { Dao, DaoDynamoService, DaoService, VoteAction } from '@sputnik-v2/dao';
import {
  Proposal,
  ProposalDto,
  ProposalDynamoService,
  ProposalKindAddBounty,
  ProposalKindBountyDone,
  ProposalKindTransfer,
  ProposalService,
  ProposalStatus,
  ProposalType,
} from '@sputnik-v2/proposal';
import {
  BountyContextService,
  BountyDynamoService,
  BountyService,
} from '@sputnik-v2/bounty';
import { EventService } from '@sputnik-v2/event';
import { NFTTokenService, TokenService } from '@sputnik-v2/token';
import {
  DaoFundsReceiptService,
  DaoFundsTokenReceiptService,
} from '@sputnik-v2/dao-funds';
import {
  buildBountyId,
  buildDelegationId,
  buildProposalId,
} from '@sputnik-v2/utils';
import { CacheService } from '@sputnik-v2/cache';
import { OpensearchService } from '@sputnik-v2/opensearch';
import { DynamodbService } from '@sputnik-v2/dynamodb';

import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';

import { HandledReceiptActionDynamoService } from './handled-receipt-action-dynamo.service';
import {
  castActProposal,
  castActProposalDao,
  castAddBounty,
  castAddProposalDao,
  castClaimBounty,
  castCreateDao,
  castCreateProposal,
  castDoneBounty,
  ContractHandler,
  ContractHandlerResult,
  ContractHandlerResultType,
  TransactionAction,
} from './types';

@Injectable()
export class TransactionActionHandlerService {
  private readonly logger = new Logger(TransactionActionHandlerService.name);

  private contractHandlers: ContractHandler[];

  constructor(
    private readonly configService: ConfigService,
    private readonly nearApiService: NearApiService,
    private readonly sputnikService: SputnikService,
    private readonly daoService: DaoService,
    private readonly daoDynamoService: DaoDynamoService,
    private readonly proposalService: ProposalService,
    private readonly bountyService: BountyService,
    private readonly bountyContextService: BountyContextService,
    private readonly eventService: EventService,
    private readonly tokenService: TokenService,
    private readonly nftTokenService: NFTTokenService,
    private readonly cacheService: CacheService,
    private readonly opensearchService: OpensearchService,
    private readonly proposalDynamoService: ProposalDynamoService,
    private readonly handledReceiptActionDynamoService: HandledReceiptActionDynamoService,
    private readonly dynamodbService: DynamodbService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly bountyDynamoService: BountyDynamoService,
    private readonly daoFundsReceiptService: DaoFundsReceiptService,
    private readonly daoFundsTokenReceiptService: DaoFundsTokenReceiptService,
  ) {
    const { contractName } = this.configService.get('near');
    // TODO: Split on multiple handlers
    this.contractHandlers = [
      {
        contractId: contractName,
        methodHandlers: {
          create: this.handleCreateDao.bind(this),
        },
      },
      {
        contractIdSuffix: `.${contractName}`,
        methodHandlers: {
          add_proposal: this.handleAddProposal.bind(this),
          act_proposal: this.handleActProposal.bind(this),
          bounty_claim: this.handleClaimUnclaimBounty.bind(this),
          bounty_giveup: this.handleClaimUnclaimBounty.bind(this),
          delegate: this.handleDelegate.bind(this),
          undelegate: this.handleDelegate.bind(this),
        },
        defaultHandler: this.handleUnknownDaoTransaction.bind(this),
      },
      {
        // Any contract id to handle ft and nft transactions
        contractIdSuffix: '',
        methodHandlers: {
          // Common
          mint: this.handleTokenMint.bind(this),

          // FT
          ft_mint: this.handleTokenMethods.bind(this),
          ft_transfer_call: this.handleTokenMethods.bind(this),
          ft_transfer: this.handleTokenMethods.bind(this),
          deposit: this.handleTokenMethods.bind(this),
          storage_deposit: this.handleTokenMethods.bind(this),
          deposit_and_stake: this.handleTokenMethods.bind(this),
          withdraw: this.handleTokenMethods.bind(this),
          storage_withdraw: this.handleTokenMethods.bind(this),
          withdraw_all: this.handleTokenMethods.bind(this),
          withdraw_unstaked: this.handleTokenMethods.bind(this),
          withdraw_from_available: this.handleTokenMethods.bind(this),

          // NFT
          nft_transfer: this.handleNftMethods.bind(this),
          nft_batch_transfer: this.handleNftMethods.bind(this),
          nft_transfer_call: this.handleNftMethods.bind(this),
          nft_approve: this.handleNftMethods.bind(this),
          nft_revoke: this.handleNftMethods.bind(this),
          nft_transfer_payout: this.handleNftMethods.bind(this),
          nft_on_approve: this.handleNftMethods.bind(this),
          nft_mint: this.handleNftMethods.bind(this),
          nft_batch_mint: this.handleNftMethods.bind(this),
          nft_burn: this.handleNftMethods.bind(this),
          nft_batch_burn: this.handleNftMethods.bind(this),
          nft_create_series: this.handleNftMethods.bind(this),
          nft_buy: this.handleNftMethods.bind(this),
        },
      },
    ];
  }

  async handleTransactionActions(actions: TransactionAction[]): Promise<{
    handledTxHashes: string[];
    results: ContractHandlerResult[];
    success: boolean;
  }> {
    const handledTxHashes = [];
    let results = [];

    // Actions are handled one by one to keep order of transactions
    for (const action of actions) {
      try {
        const actionResults = await this.handleTransactionAction(action);
        results = results.concat(actionResults.filter((result) => result));
        handledTxHashes.push(action.transactionHash);
      } catch (error) {
        this.log(
          action.transactionHash,
          `Failed to handle transaction action ${action.transactionHash}:${action.receiptId}:${action.indexInReceipt} with error: ${error} (${error.stack})`,
          'error',
        );

        // If some action failed stop handling and remove failed transaction hash
        return {
          handledTxHashes: handledTxHashes.filter(
            (transactionHash) => action.transactionHash !== transactionHash,
          ),
          results,
          success: false,
        };
      }
    }

    return { handledTxHashes, results, success: true };
  }

  async handleTransactionAction(
    action: TransactionAction,
  ): Promise<ContractHandlerResult[]> {
    const actionId = `${action.transactionHash}:${action.receiptId}:${action.indexInReceipt}`;

    if (
      action.receiverId.indexOf('astro-failed-test') === 0 &&
      (await this.featureFlagsService.check(FeatureFlags.EnableFailedDao))
    ) {
      throw new Error(`Test error - transaction action: ${actionId}`);
    }

    const handledReceiptAction =
      await this.handledReceiptActionDynamoService.check(action);
    if (handledReceiptAction) {
      this.log(
        action.transactionHash,
        `Already handled transaction action: ${actionId}`,
        'warn',
      );
      return handledReceiptAction.results;
    }

    if (action.status.Failure !== undefined) {
      this.log(
        action.transactionHash,
        `Skipping transaction action (${actionId}) due to transaction failure: ${JSON.stringify(
          action.status.Failure,
        )}`,
        'warn',
      );
      return [];
    }

    this.log(action.transactionHash, `action: ${actionId}`);
    const contractHandlers = this.getContractHandlers(action.receiverId);

    const { results } = await PromisePool.for(contractHandlers)
      .handleError((err) => {
        throw err;
      })
      .process(async (contractHandler) => {
        const handler =
          contractHandler.methodHandlers[action.methodName] ||
          contractHandler.defaultHandler;
        if (handler) {
          return handler(action);
        }
      });

    await this.saveDaoFunds(action);
    await this.handledReceiptActionDynamoService.save(action, results);

    this.log(
      action.transactionHash,
      `Transaction action successfully handled: ${actionId} - Results: ${JSON.stringify(
        results,
      )}`,
    );

    return results;
  }

  async handleCreateDao(
    txAction: TransactionAction,
  ): Promise<ContractHandlerResult> {
    const { signerId, transactionHash, args, timestamp, blockHash } = txAction;
    const { contractName } = this.configService.get('near');
    const daoId = `${args.name}.${contractName}`;
    const daoInfo = await this.sputnikService.getDaoInfo(daoId, blockHash);

    this.log(
      transactionHash,
      `Received DAO from RPC: ${JSON.stringify(daoInfo)}`,
    );
    const delegationAccounts =
      await this.daoService.getDelegationAccountsByDaoId(daoId);
    const dao = castCreateDao(
      signerId,
      transactionHash,
      daoId,
      daoInfo,
      delegationAccounts,
      timestamp,
    );

    this.log(transactionHash, `Storing new DAO: ${JSON.stringify(dao)}`);
    await this.daoService.save(dao, { updateTotalDaoFunds: true });
    await this.tokenService.saveNearBalanceToDao(dao.id, dao.amount);
    await this.daoService.setDaoVersion(daoId);
    await this.daoDynamoService.saveDaoId(daoId);
    this.log(transactionHash, `Successfully stored new DAO: ${daoId}`);

    await this.eventService.sendDaoUpdateNotificationEvent(dao, txAction);

    const daoById = await this.daoService.findOne(daoId, {
      relations: ['delegations'],
    });
    await this.opensearchService.indexDao(daoId, daoById);

    return {
      type: ContractHandlerResultType.DaoCreate,
      metadata: { daoId: dao.id },
    };
  }

  async handleAddProposal(
    txAction: TransactionAction,
  ): Promise<ContractHandlerResult> {
    const {
      receiverId,
      signerId,
      transactionHash,
      blockHash,
      timestamp,
      args,
      receiptId,
      receiptSuccessValue,
    } = txAction;
    const lastProposalId = parseInt(receiptSuccessValue);

    this.log(transactionHash, `Received proposal id: ${lastProposalId}`);

    if (isNaN(lastProposalId)) {
      this.log(
        transactionHash,
        `Error getting Proposal ID from receipt ID: ${receiptId}`,
        'warn',
      );
      return {
        type: ContractHandlerResultType.Unknown,
        metadata: { daoId: receiverId },
      };
    }

    const daoEntity = await this.daoService.findById(receiverId);
    const daoProposal = await this.sputnikService.getProposal(
      receiverId,
      lastProposalId,
      blockHash,
    );
    this.log(
      transactionHash,
      `Received proposal from RPC: ${JSON.stringify(daoProposal)}`,
    );

    if (!daoProposal) {
      this.log(
        transactionHash,
        `Error proposal ${lastProposalId} not found for DAO ${receiverId}. Skip transaction`,
        'warn',
      );
      return {
        type: ContractHandlerResultType.Unknown,
        metadata: { daoId: receiverId },
      };
    }

    const proposal = castCreateProposal(
      transactionHash,
      signerId,
      daoProposal,
      daoEntity,
      timestamp,
    );
    const dao = castAddProposalDao(
      daoEntity,
      lastProposalId,
      transactionHash,
      timestamp,
    );

    if (proposal.type === ProposalType.BountyDone) {
      const proposalKind = proposal.kind.kind as ProposalKindBountyDone;
      const bountyClaim = await this.bountyService.getLastBountyClaim(
        dao.id,
        proposalKind.bountyId,
        proposalKind.receiverId,
        timestamp,
      );
      this.log(
        transactionHash,
        `Received bounty claim: ${JSON.stringify(bountyClaim)}`,
      );
      proposal.bountyClaimId = bountyClaim?.id;

      await this.bountyDynamoService.addBountyDoneProposalId(
        dao.id,
        String(proposalKind.bountyId),
        String(proposal.proposalId),
      );
    }

    this.log(transactionHash, `Storing Proposal: ${JSON.stringify(proposal)}`);
    await this.proposalService.create(proposal);
    this.log(transactionHash, `Successfully stored Proposal: ${proposal.id}`);

    if (proposal.type === ProposalType.AddBounty) {
      this.log(transactionHash, `Storing Bounty Context: ${proposal.id}`);
      await this.bountyContextService.create(
        {
          id: proposal.id,
          daoId: proposal.daoId,
          transactionHash,
          createTimestamp: timestamp,
        },
        proposal.proposalId,
      );
      this.log(
        transactionHash,
        `Successfully stored Bounty Context: ${proposal.id}`,
      );
    }

    this.log(transactionHash, `Updating DAO proposal count: ${receiverId}`);
    await this.daoService.save(dao, { updateProposalsCount: true });
    this.log(transactionHash, `DAO successfully updated: ${receiverId}`);

    const proposalById = await this.proposalService.findOne(proposal.id, {
      loadEagerRelations: false,
      relations: ['dao', 'actions'],
    });
    const daoById = await this.daoService.findOne(proposal.daoId, {
      relations: ['delegations'],
    });
    await this.opensearchService.indexProposal(proposal.id, proposalById);
    await this.opensearchService.indexDao(proposal.daoId, daoById);

    await this.cacheService.handleProposalCache(proposal.id);

    await this.eventService.sendProposalUpdateNotificationEvent(
      proposal,
      txAction,
    );

    if (args.draftId) {
      this.log(transactionHash, `Closing draft: ${args.draftId}`);
      await this.eventService.sendCloseDraftProposalEvent(
        proposal.daoId,
        args.draftId,
        proposal.id,
      );
    }

    return {
      type: ContractHandlerResultType.ProposalCreate,
      metadata: { daoId: receiverId, proposalId: proposal.id },
    };
  }

  async handleActProposal(
    txAction: TransactionAction,
  ): Promise<ContractHandlerResult> {
    const {
      receiverId,
      signerId,
      transactionHash,
      args,
      timestamp,
      status,
      blockHash,
    } = txAction;
    const dao = await this.daoService.findById(receiverId);
    const proposalEntity = await this.proposalService.findById(
      receiverId,
      args.id,
    );
    if (!proposalEntity) {
      this.log(
        transactionHash,
        `Error proposal ${args.id} not found for DAO ${receiverId}. Skip transaction`,
        'warn',
      );
      return;
    }

    const proposalResponse = await this.sputnikService.getProposal(
      receiverId,
      args.id,
      blockHash,
    );
    this.log(
      transactionHash,
      `Received proposal from RPC: ${proposalResponse}`,
    );
    const proposal =
      proposalResponse &&
      castActProposal(
        transactionHash,
        receiverId,
        signerId,
        proposalEntity,
        proposalResponse,
        timestamp,
        args.action,
      );

    switch (args.action) {
      case VoteAction.VoteApprove:
        await this.handleApproveProposal({
          dao,
          proposal,
          receiverId,
          transactionHash,
          blockHash,
          timestamp,
          status,
        });
        break;

      case VoteAction.Finalize:
      case VoteAction.VoteReject:
        await this.handleRejectProposal({
          dao,
          proposal,
          receiverId,
          transactionHash,
          blockHash,
          timestamp,
        });
        break;

      case VoteAction.RemoveProposal:
      case VoteAction.VoteRemove:
        await this.handleRemoveProposal({
          dao,
          proposal,
          proposalEntity,
          receiverId,
          transactionHash,
          blockHash,
          timestamp,
          args,
        });
        break;

      default:
        await this.proposalService.create(proposal);
        break;
    }

    const proposalId = buildProposalId(receiverId, args.id);
    const proposalById = await this.proposalService.findOne(proposalId, {
      loadEagerRelations: false,
      relations: ['dao', 'actions'],
    });
    const daoById = await this.daoService.findOne(receiverId, {
      relations: ['delegations'],
    });
    await this.opensearchService.indexProposal(proposalId, proposalById);
    await this.opensearchService.indexDao(receiverId, daoById);

    await this.cacheService.handleProposalCache(proposalId);

    await this.eventService.sendProposalUpdateNotificationEvent(
      proposal || proposalEntity,
      txAction,
    );

    return {
      type: ContractHandlerResultType.ProposalVote,
      metadata: {
        daoId: receiverId,
        proposalId,
        action: args.action,
      },
    };
  }

  async handleApproveProposal({
    dao,
    proposal,
    receiverId,
    transactionHash,
    blockHash,
    timestamp,
    status,
  }: {
    dao: Dao | PartialEntity<DaoModel>;
    proposal: ProposalDto;
    receiverId: string;
    transactionHash: string;
    blockHash: string;
    timestamp: string;
    status: any;
  }) {
    const state = await this.nearApiService.getAccountState(receiverId);
    this.log(
      transactionHash,
      `Received ${receiverId} state from RPC: ${state}`,
    );
    const proposalKindType = proposal.kind?.kind.type;
    let config: SputnikDaoConfig;
    let policy: SputnikDaoPolicy;
    let delegationAccounts: string[];
    let stakingContract: string;
    let lastBountyId: number;

    this.log(transactionHash, `Updating Proposal: ${JSON.stringify(proposal)}`);
    await this.proposalService.create(proposal);
    this.log(transactionHash, `Proposal successfully updated: ${proposal.id}`);

    if (proposal.status === ProposalStatus.Approved) {
      const { tokenId, receiverId } = proposal.kind
        .kind as ProposalKindTransfer;
      if (proposalKindType === ProposalType.Transfer && tokenId) {
        const { contractName } = this.configService.get('near');
        this.log(
          transactionHash,
          `Updating ${receiverId} token ${tokenId} balance`,
        );
        await this.tokenService.loadTokenById(tokenId, timestamp, blockHash);
        await this.tokenService.loadBalanceById(
          tokenId,
          dao.id,
          timestamp,
          blockHash,
        );
        if (receiverId && String(receiverId).includes(contractName)) {
          await this.tokenService.loadBalanceById(
            tokenId,
            receiverId,
            timestamp,
            blockHash,
          );
        }
      }

      if (proposalKindType === ProposalType.ChangeConfig) {
        config = await this.sputnikService.getConfig(receiverId, blockHash);
        this.log(
          transactionHash,
          `Received DAO config from RPC: ${JSON.stringify(config)}`,
        );
      }

      if (
        [
          ProposalType.ChangePolicy,
          ProposalType.AddMemberToRole,
          ProposalType.RemoveMemberFromRole,
        ].includes(proposalKindType)
      ) {
        policy = await this.sputnikService.getPolicy(receiverId, blockHash);
        this.log(
          transactionHash,
          `Received DAO policy from RPC: ${JSON.stringify(policy)}`,
        );
        delegationAccounts = await this.daoService.getDelegationAccountsByDaoId(
          dao.id,
        );
      }

      if (proposalKindType === ProposalType.SetStakingContract) {
        stakingContract = await this.sputnikService.getStakingContract(
          receiverId,
          blockHash,
        );
        this.log(
          transactionHash,
          `Received DAO stakingContract from RPC: ${stakingContract}`,
        );
      }

      if (proposalKindType === ProposalType.BountyDone) {
        await this.handleDoneBounty({
          dao,
          proposalKind: proposal.kind.kind as ProposalKindBountyDone,
          transactionHash,
          blockHash,
          timestamp,
        });
      }

      if (proposalKindType === ProposalType.AddBounty) {
        lastBountyId = await this.sputnikService.getLastBountyId(
          receiverId,
          blockHash,
        );
        this.log(
          transactionHash,
          `Received DAO lastBountyId from RPC: ${lastBountyId}`,
        );
        await this.handleAddBounty({
          dao,
          proposal,
          lastBountyId,
          transactionHash,
          blockHash,
          timestamp,
        });
      }

      if (proposalKindType === ProposalType.UpgradeSelf) {
        // TODO: Remove temporary workaround when transaction failure check will be implemented
        this.log(
          transactionHash,
          `Start timeout to load new Version of DAO:  ${receiverId}`,
        );
        setTimeout(async () => {
          this.log(
            transactionHash,
            `Updating Version of DAO: ${receiverId} due to transaction`,
          );
          const daoVersionHash = await this.daoService.setDaoVersion(dao.id);
          this.log(
            transactionHash,
            `DAO ${receiverId} Version successfully updated to ${daoVersionHash}`,
          );
        }, 30000);
      }

      proposal.failure = status?.Failure;
    }

    const updatedDao = castActProposalDao({
      dao,
      amount: state.amount,
      config,
      policy,
      delegationAccounts,
      lastBountyId,
      stakingContract,
      transactionHash,
      timestamp,
    });
    this.log(transactionHash, `Updating DAO: ${JSON.stringify(updatedDao)}`);
    await this.daoService.save(updatedDao, {
      updateProposalsCount: true,
      updateTotalDaoFunds: true,
      updateBountiesCount: true,
    });
    await this.tokenService.saveNearBalanceToDao(receiverId, state.amount);
    this.log(transactionHash, `DAO successfully updated: ${receiverId}`);
  }

  async handleRejectProposal({
    dao,
    proposal,
    receiverId,
    transactionHash,
    blockHash,
    timestamp,
  }: {
    dao: Dao | PartialEntity<DaoModel>;
    proposal: ProposalDto;
    receiverId: string;
    transactionHash: string;
    blockHash: string;
    timestamp: string;
  }) {
    const state = await this.nearApiService.getAccountState(receiverId);
    this.log(
      transactionHash,
      `Received ${receiverId} state from RPC: ${JSON.stringify(state)}`,
    );
    const proposalKindType = proposal.kind?.kind.type;

    if (
      (proposal.status === ProposalStatus.Rejected ||
        proposal.status === ProposalStatus.Expired) &&
      proposalKindType === ProposalType.BountyDone
    ) {
      await this.handleDoneBounty({
        dao,
        proposalKind: proposal.kind.kind as ProposalKindBountyDone,
        transactionHash,
        blockHash,
        timestamp,
      });
    }

    this.log(transactionHash, `Updating Proposal: ${JSON.stringify(proposal)}`);
    await this.proposalService.create(proposal);
    this.log(transactionHash, `Proposal successfully updated: ${proposal.id}`);

    const updatedDao = castActProposalDao({
      dao,
      amount: state.amount,
      transactionHash,
      timestamp,
    });
    this.log(transactionHash, `Updating DAO: ${JSON.stringify(updatedDao)}`);
    await this.daoService.save(updatedDao, { updateProposalsCount: true });
    await this.tokenService.saveNearBalanceToDao(receiverId, state.amount);
    this.log(transactionHash, `DAO successfully updated: ${receiverId}`);
  }

  async handleRemoveProposal({
    dao,
    proposal,
    proposalEntity,
    receiverId,
    transactionHash,
    blockHash,
    args,
    timestamp,
  }: {
    dao: Dao | PartialEntity<DaoModel>;
    proposal: ProposalDto | null;
    proposalEntity: Proposal | PartialEntity<ProposalModel>;
    receiverId: string;
    transactionHash: string;
    blockHash: string;
    args: any;
    timestamp: string;
  }) {
    const state = await this.nearApiService.getAccountState(receiverId);
    this.log(
      transactionHash,
      `Received ${receiverId} state from RPC: ${JSON.stringify(state)}`,
    );

    if (!proposal) {
      const proposalKindType = proposalEntity?.kind?.type;

      if (proposalKindType === ProposalType.BountyDone) {
        await this.handleDoneBounty({
          dao,
          proposalKind: proposalEntity?.kind as ProposalKindBountyDone,
          transactionHash,
          blockHash,
          timestamp,
        });
      }

      if (proposalKindType === ProposalType.AddBounty) {
        this.log(
          transactionHash,
          `Removing Bounty Context: ${proposalEntity?.id}`,
        );
        await this.bountyContextService.remove(dao.id, args.id);
      }

      this.log(transactionHash, `Removing Proposal: ${args.id}`);
      await this.proposalService.remove(dao.id, args.id);
      this.log(transactionHash, `Successfully removed Proposal: ${args.id}`);
    } else {
      this.log(
        transactionHash,
        `Updating Proposal: ${JSON.stringify(proposal)}`,
      );
      await this.proposalService.create(proposal);
      this.log(
        transactionHash,
        `Successfully updated Proposal: ${proposal.id}`,
      );
    }

    this.log(transactionHash, `Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.save(
      castActProposalDao({
        dao,
        amount: state.amount,
        transactionHash,
        timestamp,
      }),
      { updateProposalsCount: true },
    );
    await this.tokenService.saveNearBalanceToDao(receiverId, state.amount);
    this.log(transactionHash, `DAO successfully updated: ${receiverId}`);
  }

  async handleAddBounty({
    dao,
    proposal,
    lastBountyId,
    transactionHash,
    blockHash,
    timestamp,
  }: {
    dao: Dao | PartialEntity<DaoModel>;
    proposal: ProposalDto;
    lastBountyId: number;
    transactionHash: string;
    blockHash: string;
    timestamp: string;
  }) {
    const { bounty: bountyData } = proposal.kind?.kind as ProposalKindAddBounty;

    // TODO
    // Try to find bounty in contract `get_bounties()` but this method does not always work,
    // because bounties data mutates in contract as well as `times` property
    // To solve this problem we should not count on `id` property of `bounty`
    // instead of it, use `proposalIndex` to find right bounty.
    const daoBounty = await this.sputnikService.findLastBounty(
      dao.id,
      lastBountyId,
      bountyData,
      blockHash,
    );
    this.log(
      transactionHash,
      `Received bounty from RPC: ${JSON.stringify(daoBounty)}`,
    );

    if (!daoBounty) {
      this.log(
        transactionHash,
        `Bounty ${lastBountyId} not found for DAO ${dao.id}. Skip transaction`,
        'warn',
      );
      return;
    }

    const bountyId = daoBounty.id;
    const bounty = await this.bountyService.findById(dao.id, bountyId);

    if (bounty) {
      this.log(
        transactionHash,
        `Bounty has already been created: ${JSON.stringify(bounty)}`,
      );
    } else {
      const newBounty = castAddBounty(
        dao,
        proposal,
        bountyData,
        bountyId,
        transactionHash,
        timestamp,
      );
      this.log(
        transactionHash,
        `Storing new Bounty: ${JSON.stringify(newBounty)}`,
      );
      await this.bountyService.create(newBounty);
      this.log(transactionHash, 'Successfully stored new Bounty');
    }

    const bountyById = await this.bountyService.findOne(
      buildBountyId(dao.id, bountyId),
      {
        relations: [
          'bountyContext',
          'bountyContext.proposal',
          'bountyDoneProposals',
          'bountyClaims',
        ],
      },
    );
    await this.opensearchService.indexBounty(bountyById.id, bountyById);
  }

  async handleDoneBounty({
    dao,
    proposalKind,
    transactionHash,
    blockHash,
    timestamp,
  }: {
    dao: Dao | PartialEntity<DaoModel>;
    proposalKind: ProposalKindBountyDone;
    transactionHash: string;
    blockHash: string;
    timestamp: string;
  }) {
    const { bountyId, receiverId } = proposalKind;
    const bounty = await this.bountyService.findById(dao.id, bountyId, {
      relations: ['bountyClaims', 'bountyContext'],
    });

    if (!bounty) {
      this.log(
        transactionHash,
        `Bounty ${bountyId} not found for DAO ${dao.id}. Skip transaction`,
        'warn',
      );
      return;
    }

    // TODO
    // This method does not work for old transactions because bounty data
    // mutates in contract and contract method could return unexpected values
    const bountyData = await this.sputnikService.getBounty(
      dao.id,
      bountyId,
      blockHash,
    );
    this.log(
      transactionHash,
      `Received bounty from RPC: ${JSON.stringify(bountyData)}`,
    );
    const numberOfClaims = await this.sputnikService.getBountyNumberOfClaims(
      dao.id,
      bountyId,
      blockHash,
    );
    this.log(
      transactionHash,
      `Received numberOfClaims from RPC: ${numberOfClaims}`,
    );
    const bountyClaims = await this.sputnikService.getAccountBountyClaims(
      dao.id,
      receiverId,
      blockHash,
    );
    this.log(
      transactionHash,
      `Received bountyClaims from RPC: ${JSON.stringify(bountyClaims)}`,
    );

    const updatedBounty = castDoneBounty(
      dao,
      receiverId,
      bounty,
      bountyData,
      numberOfClaims,
      bountyClaims,
      transactionHash,
      timestamp,
    );
    this.log(
      transactionHash,
      `Updating Bounty: ${JSON.stringify(updatedBounty)}`,
    );
    await this.bountyService.create(updatedBounty);
    this.log(transactionHash, `Bounty successfully updated: ${bounty.id}`);

    const bountyById = await this.bountyService.findOne(bounty.id, {
      relations: [
        'bountyContext',
        'bountyContext.proposal',
        'bountyDoneProposals',
        'bountyClaims',
      ],
    });
    await this.opensearchService.indexBounty(bounty.id, bountyById);
  }

  async handleClaimUnclaimBounty({
    receiverId,
    signerId,
    transactionHash,
    blockHash,
    methodName,
    args,
    timestamp,
  }: TransactionAction): Promise<ContractHandlerResult> {
    const { id } = args;
    const bounty = await this.bountyService.findById(receiverId, id, {
      relations: ['bountyClaims', 'bountyContext'],
    });

    if (!bounty) {
      this.log(
        transactionHash,
        `Bounty ${id} not found for DAO ${receiverId}. Skip transaction`,
        'warn',
      );
      return;
    }

    // TODO
    // This method does not work for old transactions because bounty data
    // mutates in contract and contract method could return unexpected values
    const bountyClaims = await this.sputnikService.getAccountBountyClaims(
      receiverId,
      signerId,
      blockHash,
    );
    this.log(
      transactionHash,
      `Received bountyClaims from RPC: ${JSON.stringify(bountyClaims)}`,
    );
    const numberOfClaims = await this.sputnikService.getBountyNumberOfClaims(
      receiverId,
      bounty.bountyId,
      blockHash,
    );
    this.log(
      transactionHash,
      `Received numberOfClaims from RPC: ${numberOfClaims}`,
    );

    const removedClaim =
      methodName === 'bounty_giveup'
        ? this.bountyService.findLastClaim(
            bounty.bountyClaims,
            signerId,
            timestamp,
          )
        : undefined;
    this.log(
      transactionHash,
      `Received removed claim: ${JSON.stringify(removedClaim)}`,
    );

    const updatedBounty = castClaimBounty(
      bounty,
      signerId,
      receiverId,
      transactionHash,
      bountyClaims,
      numberOfClaims,
      removedClaim,
      timestamp,
    );
    this.log(
      transactionHash,
      `Updating Bounty: ${JSON.stringify(updatedBounty)}`,
    );
    await this.bountyService.create(updatedBounty);
    this.log(transactionHash, `Bounty successfully updated: ${bounty.id}`);

    const bountyById = await this.bountyService.findOne(bounty.id, {
      relations: [
        'bountyContext',
        'bountyContext.proposal',
        'bountyDoneProposals',
        'bountyClaims',
      ],
    });
    await this.opensearchService.indexBounty(bounty.id, bountyById);

    return {
      type: ContractHandlerResultType.BountyClaim,
      metadata: {
        daoId: receiverId,
        bountyContextId: bounty.proposalId,
      },
    };
  }

  async handleUnknownDaoTransaction({
    receiverId,
    transactionHash,
  }: TransactionAction) {
    const dao = await this.daoService.findById(receiverId);
    const state = await this.nearApiService.getAccountState(receiverId);
    this.log(
      transactionHash,
      `Received ${receiverId} state from RPC: ${JSON.stringify(state)}`,
    );

    dao.amount = state.amount;

    this.log(transactionHash, `Updating DAO: ${JSON.stringify(dao)}`);
    await this.daoService.save(dao, { updateTotalDaoFunds: true });
    await this.tokenService.saveNearBalanceToDao(dao.id, dao.amount);
    this.log(transactionHash, `DAO successfully updated: ${receiverId}`);

    const daoById = await this.daoService.findOne(dao.id, {
      relations: ['delegations'],
    });
    await this.opensearchService.indexDao(dao.id, daoById);

    return {
      type: ContractHandlerResultType.Unknown,
      metadata: { daoId: receiverId },
    };
  }

  async handleDelegate(
    txAction: TransactionAction,
  ): Promise<ContractHandlerResult> {
    const {
      txSignerId,
      receiverId: daoId,
      args,
      transactionHash,
      blockHash,
    } = txAction;
    const { account_id: accountId } = args;

    const balance = await this.sputnikService.getDelegationBalance(
      daoId,
      accountId,
      blockHash,
    );
    await this.daoService.saveDelegation({
      daoId,
      accountId,
      balance,
    });

    const existingDelegations = await this.daoService.getDelegationsByDaoId(
      daoId,
    );

    const dao = await this.daoService.findById(daoId);
    if (!dao.stakingContract) {
      this.log(
        transactionHash,
        `Inconsistent state - no staking contract registered for DAO ${daoId}.`,
        'warn',
      );

      return;
    }

    const stakingContract = await this.nearApiService.getStakingContract(
      dao.stakingContract,
    );

    const user = await stakingContract.get_user({ account_id: txSignerId });
    const { delegated_amounts } = user || {};
    if (!delegated_amounts?.length) {
      return;
    }

    const delegatedAmounts = delegated_amounts?.reduce(
      (acc, value) => ({
        ...acc,
        [value[0]]: (BigInt(acc[value[0]] || 0) + BigInt(value[1])).toString(),
      }),
      {},
    );

    for (const delegationAccountId in delegatedAmounts) {
      const delegation = {
        daoId,
        accountId: delegationAccountId,
        delegators: {
          ...existingDelegations.find(
            ({ id }) => id === buildDelegationId(daoId, delegationAccountId),
          )?.delegators,
          [txSignerId]: delegatedAmounts[delegationAccountId],
        },
      };

      if (accountId === delegationAccountId) {
        await this.daoService.saveDelegation(delegation);

        continue;
      }

      const accountBalance = await this.sputnikService.getDelegationBalance(
        daoId,
        delegationAccountId,
        blockHash,
      );

      await this.daoService.saveDelegation({
        ...delegation,
        balance: accountBalance,
      });
    }

    await this.daoService.updateDaoMembers(daoId);

    const daoById = await this.daoService.findOne(dao.id, {
      relations: ['delegations'],
    });
    await this.opensearchService.indexDao(dao.id, daoById);

    return { type: ContractHandlerResultType.Delegate };
  }

  async handleTokenMint(
    txAction: TransactionAction,
  ): Promise<ContractHandlerResult> {
    const { receiverId, transactionHash } = txAction;
    this.log(transactionHash, `Handling "mint" method of ${receiverId}`);

    try {
      this.log(transactionHash, `Checking if ${receiverId} is Fungible Token`);
      await this.nearApiService.callContractRetry(
        receiverId,
        'ft_total_supply',
      );
      await this.handleTokenMethods(txAction);
      return;
    } catch (err) {
      this.log(
        transactionHash,
        `Contract ${receiverId} is not Fungible Token`,
        'warn',
      );
    }

    try {
      this.log(transactionHash, `Checking if ${receiverId} is NFT`);
      await this.nearApiService.callContractRetry(
        receiverId,
        'nft_total_supply',
      );
      await this.handleNftMethods(txAction);
      return { type: ContractHandlerResultType.TokenUpdate };
    } catch (err) {
      this.log(transactionHash, `Contract ${receiverId} is not NFT`, 'warn');
    }

    this.log(
      transactionHash,
      `Called "mint" method on unknown contract ${receiverId}. Skip transaction`,
      'warn',
    );
    return { type: ContractHandlerResultType.TokenUpdate };
  }

  async handleTokenMethods(
    txAction: TransactionAction,
  ): Promise<ContractHandlerResult> {
    const daoIds = [
      ...new Set([
        txAction.txSignerId,
        txAction.predecessorId,
        txAction.args?.receiver_id,
        txAction.args?.account_id,
      ]),
    ].filter((accountId) => accountId && this.isDaoContract(accountId));
    await this.handleTokenUpdate(txAction, daoIds);

    await this.cacheService.handleTokenCache();
    return { type: ContractHandlerResultType.TokenUpdate };
  }

  async handleNftMethods(
    txAction: TransactionAction,
  ): Promise<ContractHandlerResult> {
    const daoIds = [
      ...new Set([
        txAction.txSignerId,
        txAction.predecessorId,
        txAction.args?.receiver_id,
        txAction.args?.account_id,
        txAction.args?.creator_id,
        txAction.args?.owner_id,
        ...(txAction.args?.token_ids?.map((arr) => arr[1]) || []),
      ]),
    ].filter((accountId) => accountId && this.isDaoContract(accountId));
    await this.handleNftUpdate(txAction, daoIds);

    await this.cacheService.handleNFTCache();
    return { type: ContractHandlerResultType.NftUpdate };
  }

  async handleTokenUpdate(
    { receiverId, transactionHash, timestamp, blockHash }: TransactionAction,
    accountIds: string[],
  ) {
    try {
      this.log(transactionHash, `Storing Token: ${receiverId}`);
      const tokenData = await this.tokenService.loadTokenById(
        receiverId,
        timestamp,
        blockHash,
      );
      this.log(
        transactionHash,
        `Received token from RPC: ${JSON.stringify(tokenData)}`,
      );
      this.log(transactionHash, `Token successfully stored: ${receiverId}`);
    } catch (err) {
      this.log(
        transactionHash,
        `Failed to load token: ${receiverId}. Skip transaction. Error: ${err}`,
        'warn',
      );
      return;
    }

    for (const accountId of accountIds) {
      try {
        this.log(
          transactionHash,
          `Updating Token ${receiverId} balance for ${accountId}`,
        );
        const balanceData = await this.tokenService.loadBalanceById(
          receiverId,
          accountId,
          timestamp,
          blockHash,
        );
        this.log(
          transactionHash,
          `Received token balance from RPC: ${JSON.stringify(balanceData)}`,
        );
        this.log(
          transactionHash,
          `Token ${receiverId} balance for ${accountId} successfully updated`,
        );
      } catch (err) {
        this.log(
          transactionHash,
          `Failed to load token  ${receiverId} balance for ${accountId}. Error: ${err}`,
          'warn',
        );
      }
    }
  }

  async handleNftUpdate(
    { transactionHash, receiverId, timestamp, blockHash }: TransactionAction,
    accountIds: string[],
  ) {
    for (const accountId of accountIds) {
      try {
        this.log(
          transactionHash,
          `Updating NFT ${receiverId} for ${accountId}`,
        );
        const nftData = await this.nftTokenService.loadNFT(
          receiverId,
          accountId,
          timestamp,
          blockHash,
        );
        this.log(
          transactionHash,
          `Received NFTs from RPC: ${JSON.stringify(nftData)}`,
        );
        await this.daoService.save(
          { id: accountId },
          { updateNftsCount: true },
        );
        this.log(
          transactionHash,
          `NFT ${receiverId} for ${accountId} successfully updated`,
        );
      } catch (err) {
        this.log(
          transactionHash,
          `Failed to load NFT ${receiverId} for ${accountId}. Error: ${err}`,
          'warn',
        );
      }
    }
  }

  async saveDaoFunds(action: TransactionAction) {
    if (action.kind !== 'Transfer' && action.kind !== 'FunctionCall') {
      return;
    }

    // save receipts with attached deposit
    if (
      action.deposit &&
      BigInt(action.deposit) > 0n &&
      (this.isDaoContract(action.predecessorId) ||
        this.isDaoContract(action.receiverId))
    ) {
      const model = await this.daoFundsReceiptService.save({
        daoId: this.isDaoContract(action.predecessorId)
          ? action.predecessorId
          : action.receiverId,
        receiptId: action.receiptId,
        indexInReceipt: action.indexInReceipt,
        predecessorId: action.predecessorId,
        receiverId: action.receiverId,
        kind: action.kind,
        deposit: action.deposit,
        methodName: action.methodName,
        args: action.args,
        transactionHash: action.transactionHash,
        createTimestamp: action.timestamp,
      });
      this.log(action.transactionHash, `Stored treasury: ${model.entityId}`);
    }

    // save receipts with token transfer calls
    if (
      action.kind === 'FunctionCall' &&
      ['ft_mint', 'ft_transfer', 'ft_transfer_call'].includes(
        action.methodName,
      ) &&
      action.args?.amount &&
      BigInt(action.args.amount) > 0n
    ) {
      const receiverId = action.args?.receiver_id ?? action.args?.account_id;

      if (
        this.isDaoContract(action.predecessorId) ||
        this.isDaoContract(receiverId)
      ) {
        const model = await this.daoFundsTokenReceiptService.save({
          daoId: this.isDaoContract(action.predecessorId)
            ? action.predecessorId
            : receiverId,
          receiptId: action.receiptId,
          indexInReceipt: action.indexInReceipt,
          senderId: action.predecessorId,
          receiverId,
          tokenId: action.receiverId,
          kind: action.kind,
          amount: action.args.amount,
          deposit: action.deposit,
          methodName: action.methodName,
          args: action.args,
          transactionHash: action.transactionHash,
          createTimestamp: action.timestamp,
        });
        this.log(
          action.transactionHash,
          `Stored token treasury: ${model.entityId}`,
        );
      }
    }
  }

  private getContractHandlers(receiverId: string): ContractHandler[] {
    return this.contractHandlers.filter((contractHandler) => {
      return (
        contractHandler.contractId === receiverId ||
        receiverId.endsWith(contractHandler.contractIdSuffix)
      );
    });
  }

  private isDaoContract(receiverId: string): boolean {
    const { contractName } = this.configService.get('near');
    return receiverId.endsWith(`.${contractName}`);
  }

  private log(
    txHash: string,
    message: string,
    level: 'log' | 'warn' | 'error' = 'log',
  ) {
    this.logger[level](`Handling transaction: ${txHash} - ${message}`);
  }
}
