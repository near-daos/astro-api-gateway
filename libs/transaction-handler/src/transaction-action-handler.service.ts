import { Injectable, Logger } from '@nestjs/common';
import { DaoModel, PartialEntity, ProposalModel } from '@sputnik-v2/dynamodb';
import PromisePool from '@supercharge/promise-pool';
import { ConfigService } from '@nestjs/config';

import {
  NearApiService,
  FTokenContract,
  NFTokenContract,
  SputnikDaoContract,
} from '@sputnik-v2/near-api';
import { SputnikService } from '@sputnik-v2/sputnikdao';
import { Dao, DaoDynamoService, DaoService } from '@sputnik-v2/dao';
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
import { BountyContextService, BountyService } from '@sputnik-v2/bounty';
import { EventService } from '@sputnik-v2/event';
import { NFTTokenService, TokenService } from '@sputnik-v2/token';
import { buildBountyId, buildDelegationId } from '@sputnik-v2/utils';
import { CacheService } from '@sputnik-v2/cache';
import { OpensearchService } from '@sputnik-v2/opensearch';

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
  VoteAction,
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
        this.logger.error(
          `Failed to handle transaction ${action.transactionHash} with error: ${error}`,
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
    if (await this.handledReceiptActionDynamoService.check(action)) {
      this.logger.warn(
        `Already handled transaction: ${action.transactionHash}`,
      );
      return [];
    }

    this.logger.log(`Handling transaction: ${action.transactionHash}`);
    const contractHandlers = this.getContractHandlers(action.receiverId);

    const { results, errors } = await PromisePool.for(contractHandlers).process(
      async (contractHandler) => {
        const handler =
          contractHandler.methodHandlers[action.methodName] ||
          contractHandler.defaultHandler;
        if (handler) {
          return handler(action);
        }
      },
    );

    if (errors.length > 0) {
      const errorMessages = errors.map((error) => error.toString()).join('; ');
      this.logger.error(
        `Handling transaction ${action.transactionHash} failed with errors: ${errorMessages}`,
      );
      throw new Error(errorMessages);
    } else {
      await this.handledReceiptActionDynamoService.save(action);

      this.logger.log(
        `Transaction successfully handled: ${action.transactionHash}`,
      );
    }

    return results;
  }

  async handleCreateDao(
    txAction: TransactionAction,
  ): Promise<ContractHandlerResult> {
    const { signerId, transactionHash, args, timestamp } = txAction;
    const { contractName } = this.configService.get('near');
    const daoId = `${args.name}.${contractName}`;
    const daoInfo = await this.sputnikService.getDaoInfo(daoId);
    const delegationAccounts =
      await this.daoService.getDelegationAccountsByDaoId(daoId);
    const dao = castCreateDao({
      signerId,
      transactionHash,
      daoId,
      daoInfo,
      delegationAccounts,
      timestamp,
    });

    this.logger.log(`Storing new DAO: ${daoId} due to transaction`);
    await this.daoService.save(dao, { updateTotalDaoFunds: true });
    await this.daoService.setDaoVersion(daoId);
    await this.daoDynamoService.saveDaoId(daoId);
    this.logger.log(`Successfully stored new DAO: ${daoId}`);

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
      timestamp,
      args,
      receiptId,
      receiptSuccessValue,
    } = txAction;

    const lastProposalId = parseInt(receiptSuccessValue);

    if (isNaN(lastProposalId)) {
      this.logger.warn(
        `Error getting Proposal ID from receipt ID: ${receiptId}`,
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
    );

    if (!daoProposal) {
      this.logger.warn(
        `Error proposal ${lastProposalId} not found for DAO ${receiverId}. Skip transaction ${transactionHash}`,
      );
      return {
        type: ContractHandlerResultType.Unknown,
        metadata: { daoId: receiverId },
      };
    }

    const proposal = castCreateProposal({
      transactionHash,
      signerId,
      proposal: daoProposal,
      dao: daoEntity,
      timestamp,
    });
    const dao = castAddProposalDao({
      dao: daoEntity,
      lastProposalId,
      transactionHash,
      timestamp,
    });

    if (proposal.type === ProposalType.BountyDone) {
      const proposalKind = proposal.kind.kind as ProposalKindBountyDone;
      const bountyClaim = await this.bountyService.getLastBountyClaim(
        dao.id,
        proposalKind.bountyId,
        proposalKind.receiverId,
        timestamp,
      );
      proposal.bountyClaimId = bountyClaim?.id;
    }

    this.logger.log(`Storing Proposal: ${proposal.id} due to transaction`);
    await this.proposalService.create(proposal);
    this.logger.log(`Successfully stored Proposal: ${proposal.id}`);

    if (proposal.type === ProposalType.AddBounty) {
      this.logger.log(
        `Storing Bounty Context: ${proposal.id} due to transaction`,
      );
      await this.bountyContextService.create(
        {
          id: proposal.id,
          daoId: proposal.daoId,
          transactionHash,
          createTimestamp: timestamp,
        },
        proposal.proposalId,
      );
      this.logger.log(`Successfully stored Bounty Context: ${proposal.id}`);
    }

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.save(dao, { updateProposalsCount: true });
    this.logger.log(`DAO successfully updated: ${receiverId}`);

    const proposalById = await this.proposalService.findOne(proposal.id, {
      loadEagerRelations: false,
      relations: ['dao', 'actions'],
    });
    const daoById = await this.daoService.findOne(proposal.daoId, {
      relations: ['delegations'],
    });
    await this.opensearchService.indexProposal(proposal.id, proposalById);
    await this.opensearchService.indexDao(proposal.daoId, daoById);
    await this.proposalDynamoService.saveProposal(proposalById);
    await this.proposalDynamoService.saveScheduleProposalExpireEvent(
      proposal.daoId,
      proposal.proposalId,
      dao.policy.proposalPeriod,
    );

    await this.cacheService.handleProposalCache(proposal);

    await this.eventService.sendProposalUpdateNotificationEvent(
      proposal,
      txAction,
    );

    if (args.draftId) {
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
    const { receiverId, signerId, transactionHash, args, timestamp, status } =
      txAction;
    const dao = await this.daoService.findById(receiverId);
    const daoContract = this.nearApiService.getContract<SputnikDaoContract>(
      'sputnikDao',
      receiverId,
    );
    const proposalResponse = await daoContract
      .get_proposal({ id: args.id })
      .catch(() => null);
    const proposal =
      proposalResponse &&
      castActProposal({
        transactionHash,
        contractId: receiverId,
        signerId,
        proposal: proposalResponse,
        timestamp,
        action: args.action,
      });
    const proposalEntity = await this.proposalService.findById(
      receiverId,
      args.id,
    );

    switch (args.action) {
      case VoteAction.VoteApprove:
        await this.handleApproveProposal(
          dao,
          daoContract,
          proposal,
          receiverId,
          transactionHash,
          timestamp,
          status,
        );
        break;

      case VoteAction.Finalize:
      case VoteAction.VoteReject:
        await this.handleRejectProposal(
          dao,
          daoContract,
          proposal,
          receiverId,
          transactionHash,
          timestamp,
        );
        break;

      case VoteAction.RemoveProposal:
      case VoteAction.VoteRemove:
        await this.handleRemoveProposal(
          dao,
          daoContract,
          proposal,
          proposalEntity,
          receiverId,
          transactionHash,
          timestamp,
          args,
        );
        break;

      default:
        await this.proposalService.create(proposal);
        break;
    }

    const proposalById = await this.proposalService.findOne(proposal.id, {
      loadEagerRelations: false,
      relations: ['dao', 'actions'],
    });
    const daoById = await this.daoService.findOne(proposal.daoId, {
      relations: ['delegations'],
    });
    await this.opensearchService.indexProposal(proposal.id, proposalById);
    await this.opensearchService.indexDao(proposal.daoId, daoById);

    await this.cacheService.handleProposalCache(proposal);

    await this.eventService.sendProposalUpdateNotificationEvent(
      proposal || proposalEntity,
      txAction,
    );

    return {
      type: ContractHandlerResultType.ProposalVote,
      metadata: {
        daoId: receiverId,
        proposalId: proposal.id,
        action: args.action,
      },
    };
  }

  async handleApproveProposal(
    dao: Dao | PartialEntity<DaoModel>,
    daoContract: SputnikDaoContract,
    proposal: ProposalDto,
    receiverId: string,
    transactionHash: string,
    timestamp: number,
    status: any,
  ) {
    const state = await this.nearApiService.getAccountState(receiverId);
    const proposalKindType = proposal.kind?.kind.type;
    let config;
    let policy;
    let delegationAccounts;
    let stakingContract;
    let lastBountyId;

    if (proposal.status === ProposalStatus.Approved) {
      const { tokenId, receiverId } = proposal.kind
        .kind as ProposalKindTransfer;
      if (proposalKindType === ProposalType.Transfer && tokenId) {
        const { contractName } = this.configService.get('near');
        await this.tokenService.loadTokenById(tokenId, timestamp);
        await this.tokenService.loadBalanceById(tokenId, dao.id, timestamp);
        if (receiverId && String(receiverId).includes(contractName)) {
          await this.tokenService.loadBalanceById(
            tokenId,
            receiverId,
            timestamp,
          );
        }
      }

      if (proposalKindType === ProposalType.ChangeConfig) {
        config = await daoContract.get_config();
      }

      if (
        [
          ProposalType.ChangePolicy,
          ProposalType.AddMemberToRole,
          ProposalType.RemoveMemberFromRole,
        ].includes(proposalKindType)
      ) {
        policy = await daoContract.get_policy();
        delegationAccounts = await this.daoService.getDelegationAccountsByDaoId(
          dao.id,
        );
      }

      if (proposalKindType === ProposalType.SetStakingContract) {
        stakingContract = await daoContract.get_staking_contract();
      }

      if (proposalKindType === ProposalType.BountyDone) {
        await this.handleDoneBounty(
          dao,
          daoContract,
          proposal.kind.kind as ProposalKindBountyDone,
          transactionHash,
          timestamp,
        );
      }

      if (proposalKindType === ProposalType.AddBounty) {
        lastBountyId = await daoContract.get_last_bounty_id();
        await this.handleAddBounty(
          dao,
          proposal,
          lastBountyId,
          transactionHash,
          timestamp,
        );
      }

      if (proposalKindType === ProposalType.UpgradeSelf) {
        // TODO: Remove temporary workaround when transaction failure check will be implemented
        this.logger.log(
          `Start timeout to load new Version of DAO:  ${receiverId}`,
        );
        setTimeout(async () => {
          this.logger.log(
            `Updating Version of DAO: ${receiverId} due to transaction`,
          );
          const daoVersionHash = await this.daoService.setDaoVersion(dao.id);
          this.logger.log(
            `DAO ${receiverId} Version successfully updated to ${daoVersionHash}`,
          );
        }, 30000);
      }

      proposal.failure = status?.Failure;
    }

    this.logger.log(`Updating Proposal: ${proposal.id} due to transaction`);
    await this.proposalService.create(proposal);
    this.logger.log(`Proposal successfully updated: ${proposal.id}`);

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.save(
      castActProposalDao({
        dao,
        amount: state.amount,
        config,
        policy,
        delegationAccounts,
        lastBountyId,
        stakingContract,
        transactionHash,
        timestamp,
      }),
      {
        updateProposalsCount: true,
        updateTotalDaoFunds: true,
        updateBountiesCount: true,
      },
    );
    this.logger.log(`DAO successfully updated: ${receiverId}`);
  }

  async handleRejectProposal(
    dao: Dao | PartialEntity<DaoModel>,
    daoContract: SputnikDaoContract,
    proposal: ProposalDto,
    receiverId: string,
    transactionHash: string,
    timestamp: number,
  ) {
    const state = await this.nearApiService.getAccountState(receiverId);
    const proposalKindType = proposal.kind?.kind.type;

    if (
      (proposal.status === ProposalStatus.Rejected ||
        proposal.status === ProposalStatus.Expired) &&
      proposalKindType === ProposalType.BountyDone
    ) {
      await this.handleDoneBounty(
        dao,
        daoContract,
        proposal.kind.kind as ProposalKindBountyDone,
        transactionHash,
        timestamp,
      );
    }

    this.logger.log(`Updating Proposal: ${proposal.id} due to transaction`);
    await this.proposalService.create(proposal);
    this.logger.log(`Proposal successfully updated: ${proposal.id}`);

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.save(
      castActProposalDao({
        dao,
        amount: state.amount,
        transactionHash,
        timestamp,
      }),
      { updateProposalsCount: true },
    );
    this.logger.log(`DAO successfully updated: ${receiverId}`);
  }

  async handleRemoveProposal(
    dao: Dao | PartialEntity<DaoModel>,
    daoContract: SputnikDaoContract,
    proposal: ProposalDto,
    proposalEntity: Proposal | PartialEntity<ProposalModel>,
    receiverId: string,
    transactionHash: string,
    args: any,
    timestamp: number,
  ) {
    const state = await this.nearApiService.getAccountState(receiverId);

    if (!proposal) {
      const proposalKindType = proposalEntity?.kind?.type;

      if (proposalKindType === ProposalType.BountyDone) {
        await this.handleDoneBounty(
          dao,
          daoContract,
          proposalEntity?.kind as ProposalKindBountyDone,
          transactionHash,
          timestamp,
        );
      }

      if (proposalKindType === ProposalType.AddBounty) {
        this.logger.log(
          `Removing Bounty Context: ${proposalEntity?.id} due to transaction`,
        );
        await this.bountyContextService.remove(dao.id, proposal?.proposalId);
      }

      this.logger.log(`Removing Proposal: ${args.id} due to transaction`);
      await this.proposalService.remove(dao.id, proposal?.proposalId);
    } else {
      this.logger.log(`Updating Proposal: ${proposal.id} due to transaction`);
      await this.proposalService.create(proposal);
      this.logger.log(`Successfully updated Proposal: ${proposal.id}`);
    }

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.save(
      castActProposalDao({
        dao,
        amount: state.amount,
        transactionHash,
        timestamp,
      }),
      { updateProposalsCount: true },
    );
    this.logger.log(`DAO successfully updated: ${receiverId}`);
  }

  async handleAddBounty(
    dao: Dao | PartialEntity<DaoModel>,
    proposal: ProposalDto,
    lastBountyId: number,
    transactionHash: string,
    timestamp: number,
  ) {
    const { bounty: bountyData } = proposal.kind?.kind as ProposalKindAddBounty;
    const daoBounty = await this.sputnikService.findLastBounty(
      dao.id,
      lastBountyId,
      bountyData,
    );

    if (!daoBounty) {
      this.logger.warn(
        `Bounty ${lastBountyId} not found for DAO ${dao.id}. Skip transaction ${transactionHash}`,
      );
      return;
    }

    const bountyId = daoBounty.id;
    const bounty = await this.bountyService.findById(dao.id, bountyId);

    if (bounty) {
      this.logger.log('Bounty has already been created');
    } else {
      this.logger.log('Storing new Bounty due to transaction');
      await this.bountyService.create(
        castAddBounty({
          dao,
          proposal,
          bountyData,
          bountyId,
          transactionHash,
          timestamp,
        }),
      );
      this.logger.log('Successfully stored new Bounty');
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
    await this.opensearchService.indexBounty(bounty.id, bountyById);
  }

  async handleDoneBounty(
    dao: Dao | PartialEntity<DaoModel>,
    daoContract: SputnikDaoContract,
    proposalKind: ProposalKindBountyDone,
    transactionHash: string,
    timestamp: number,
  ) {
    const { bountyId, receiverId } = proposalKind;
    const bounty = await this.bountyService.findById(dao.id, bountyId, {
      relations: ['bountyClaims', 'bountyContext'],
    });

    if (!bounty) {
      this.logger.warn(
        `Bounty ${bountyId} not found for DAO ${dao.id}. Skip transaction ${transactionHash}`,
      );
      return;
    }

    const bountyData = await daoContract.get_bounty({
      id: bountyId,
    });
    const numberOfClaims = await daoContract.get_bounty_number_of_claims({
      id: bountyId,
    });
    const bountyClaims = await daoContract.get_bounty_claims({
      account_id: receiverId,
    });

    this.logger.log(`Updating Bounty: ${bounty.id} due to transaction`);
    await this.bountyService.create(
      castDoneBounty({
        dao,
        accountId: receiverId,
        bounty,
        bountyData,
        numberOfClaims,
        bountyClaims,
        transactionHash,
        timestamp,
      }),
    );
    this.logger.log(`Bounty successfully updated: ${bounty.id}`);

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
    methodName,
    args,
    timestamp,
  }: TransactionAction): Promise<ContractHandlerResult> {
    const daoContract = this.nearApiService.getContract<SputnikDaoContract>(
      'sputnikDao',
      receiverId,
    );
    const { id } = args;
    const bounty = await this.bountyService.findById(receiverId, id, {
      relations: ['bountyClaims', 'bountyContext'],
    });

    if (!bounty) {
      this.logger.warn(
        `Bounty ${id} not found for DAO ${receiverId}. Skip transaction ${transactionHash}`,
      );
      return;
    }

    const bountyClaims = await daoContract.get_bounty_claims({
      account_id: signerId,
    });
    const numberOfClaims = await daoContract.get_bounty_number_of_claims({
      id: bounty.bountyId,
    });

    const getRemovedClaim = () =>
      methodName === 'bounty_giveup'
        ? this.bountyService.findLastClaim(
            bounty.bountyClaims,
            signerId,
            timestamp,
          )
        : undefined;

    this.logger.log(`Updating Bounty: ${bounty.id} due to transaction`);
    await this.bountyService.create(
      castClaimBounty({
        bounty,
        accountId: signerId,
        daoId: receiverId,
        transactionHash,
        bountyClaims,
        numberOfClaims,
        removedClaim: getRemovedClaim(),
        timestamp,
      }),
    );
    this.logger.log(`Bounty successfully updated: ${bounty.id}`);

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

  async handleUnknownDaoTransaction({ receiverId }: TransactionAction) {
    const dao = await this.daoService.findById(receiverId);
    const state = await this.nearApiService.getAccountState(receiverId);

    dao.amount = Number(state.amount);

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.save(dao, { updateTotalDaoFunds: true });
    this.logger.log(`DAO successfully updated: ${receiverId}`);

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
    const { txSignerId, receiverId: daoId, args } = txAction;
    const { account_id: accountId } = args;

    const daoContract = this.nearApiService.getContract<SputnikDaoContract>(
      'sputnikDao',
      daoId,
    );

    const balance = await daoContract.delegation_balance_of({
      account_id: accountId,
    });

    await this.daoService.saveDelegation({
      daoId,
      accountId,
      balance,
    });

    const existingDelegations = await this.daoService.getDelegationsByDaoId(
      daoId,
    );

    const dao = await this.daoService.findOne(daoId);
    if (!dao.stakingContract) {
      this.logger.warn(
        `Inconsistent state - no staking contract registered for DAO ${daoId}.`,
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

      const accountBalance = await daoContract.delegation_balance_of({
        account_id: delegationAccountId,
      });

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
    await this.daoDynamoService.saveDao(daoById);

    return { type: ContractHandlerResultType.Delegate };
  }

  async handleTokenMint(
    txAction: TransactionAction,
  ): Promise<ContractHandlerResult> {
    this.logger.log(
      `Handling "mint" method of ${txAction.receiverId} due to transaction: ${txAction.transactionHash}`,
    );

    try {
      this.logger.log(`Checking if ${txAction.receiverId} is Fungible Token`);
      const ftContract = this.nearApiService.getContract<FTokenContract>(
        'fToken',
        txAction.receiverId,
      );
      await ftContract.ft_total_supply();
      await this.handleTokenMethods(txAction);
      return;
    } catch (err) {
      this.logger.warn(`Contract ${txAction.receiverId} is not Fungible Token`);
    }

    try {
      const nftContract = this.nearApiService.getContract<NFTokenContract>(
        'nft',
        txAction.receiverId,
      );
      this.logger.log(`Checking if ${txAction.receiverId} is NFT`);
      await nftContract.nft_total_supply();
      await this.handleNftMethods(txAction);
      return;
    } catch (err) {
      this.logger.warn(`Contract ${txAction.receiverId} is not NFT`);
    }

    this.logger.warn(
      `Called "mint" method on unknown contract ${txAction.receiverId}. Skip transaction ${txAction.transactionHash}`,
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

  async handleTokenUpdate(txAction: TransactionAction, accountIds: string[]) {
    try {
      this.logger.log(
        `Storing Token: ${txAction.receiverId} due to transaction: ${txAction.transactionHash}`,
      );
      await this.tokenService.loadTokenById(
        txAction.receiverId,
        txAction.timestamp,
      );
      this.logger.log(`Token successfully stored: ${txAction.receiverId}`);
    } catch (err) {
      this.logger.warn(
        `Failed to load token: ${txAction.receiverId}. Skip transaction ${txAction.transactionHash}. Error: ${err}`,
      );
      return;
    }

    for (const accountId of accountIds) {
      try {
        this.logger.log(
          `Updating Token ${txAction.receiverId} balance for ${accountId} due to transaction: ${txAction.transactionHash}`,
        );
        await this.tokenService.loadBalanceById(
          txAction.receiverId,
          accountId,
          txAction.timestamp,
        );
        this.logger.log(
          `Token ${txAction.receiverId} balance for ${accountId} successfully updated`,
        );
      } catch (err) {
        this.logger.warn(
          `Failed to load token  ${txAction.receiverId} balance for ${accountId}. Transaction: ${txAction.transactionHash}. Error: ${err}`,
        );
      }
    }
  }

  async handleNftUpdate(txAction: TransactionAction, accountIds: string[]) {
    for (const accountId of accountIds) {
      try {
        this.logger.log(
          `Updating NFT ${txAction.receiverId} for ${accountId} due to transaction: ${txAction.transactionHash}`,
        );
        await this.nftTokenService.loadNFT(
          txAction.receiverId,
          accountId,
          txAction.timestamp,
        );
        await this.daoService.save(
          { id: accountId },
          { updateNftsCount: true },
        );
        this.logger.log(
          `NFT ${txAction.receiverId} for ${accountId} successfully updated`,
        );
      } catch (err) {
        this.logger.warn(
          `Failed to load NFT ${txAction.receiverId} for ${accountId}. Transaction: ${txAction.transactionHash}. Error: ${err}`,
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
    return receiverId.endsWith(contractName);
  }
}
