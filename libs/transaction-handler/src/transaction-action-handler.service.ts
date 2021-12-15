import { Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NearApiService } from '@sputnik-v2/near-api';
import { DaoService } from '@sputnik-v2/dao';
import {
  ProposalService,
  ProposalStatus,
  ProposalType,
} from '@sputnik-v2/proposal';
import { Transaction } from '@sputnik-v2/near-indexer';
import { BountyService } from '@sputnik-v2/bounty';
import { EventService } from '@sputnik-v2/event';
import { btoaJSON, buildBountyId, buildProposalId } from '@sputnik-v2/utils';

import {
  ContractHandler,
  castActProposalDao,
  castAddProposalDao,
  castCreateDao,
  castActProposal,
  castCreateProposal,
  castAddBounty,
  castClaimBounty,
  TransactionAction,
  VoteAction,
  castDoneBounty,
} from './types';

@Injectable()
export class TransactionActionHandlerService {
  private readonly logger = new Logger(TransactionActionHandlerService.name);

  private contractHandlers: ContractHandler[];

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly configService: ConfigService,
    private readonly nearApiService: NearApiService,
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
    private readonly bountyService: BountyService,
    private readonly eventService: EventService,
  ) {
    const { contractName } = this.configService.get('near');
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
        },
        defaultHandler: this.handleUnknownDaoTransaction.bind(this),
      },
    ];
  }

  async handleTransactionActions(actions: TransactionAction[]) {
    // Actions are handled one by one to keep order of transactions
    const { errors } = await PromisePool.withConcurrency(1)
      .for(actions)
      .process(async (action) => this.handleTransactionAction(action));

    errors.forEach((error) => {
      this.logger.error(
        `Failed to handle transaction ${error.item.transactionHash} with error: ${error}`,
      );
    });
  }

  async handleTransactionAction(action: TransactionAction) {
    const tx = await this.transactionRepository.findOne({
      transactionHash: action.transactionHash,
    });

    if (tx) {
      this.logger.log(
        `Skip transaction ${action.transactionHash}. Already handled`,
      );
      return;
    }

    const contractHandlers = this.getContractHandlers(action.receiverId);

    await PromisePool.for(contractHandlers).process(async (contractHandler) => {
      const handler =
        contractHandler.methodHandlers[action.methodName] ||
        contractHandler.defaultHandler;
      if (handler) {
        return handler(action);
      }
    });
  }

  async handleCreateDao(txAction: TransactionAction) {
    const { signerId, transactionHash, args, timestamp } = txAction;
    const { contractName } = this.configService.get('near');
    const daoArgs = btoaJSON(args.args);
    const daoId = `${args.name}.${contractName}`;
    const state = await this.nearApiService.getAccountState(daoId);
    const dao = castCreateDao({
      signerId,
      transactionHash,
      daoId,
      amount: state.amount,
      args: daoArgs,
      timestamp,
    });

    this.logger.log(`Storing new DAO: ${daoId} due to transaction`);
    await this.daoService.create(dao);
    this.logger.log(`Successfully stored new DAO: ${daoId}`);

    await this.eventService.sendDaoUpdateNotificationEvent(dao, txAction);
  }

  async handleAddProposal(txAction: TransactionAction) {
    const { receiverId, signerId, transactionHash, args, timestamp } = txAction;
    const daoContract = this.nearApiService.getContract(
      'sputnikDao',
      receiverId,
    );
    const daoEntity = await this.daoService.findOne(receiverId);
    const lastProposalId = await daoContract.get_last_proposal_id();
    const daoProposal = await this.findLastProposal(
      receiverId,
      signerId,
      lastProposalId,
      args.proposal,
    );
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

    this.logger.log(`Storing Proposal: ${proposal.id} due to transaction`);
    await this.proposalService.create(proposal);
    this.logger.log(`Successfully stored Proposal: ${proposal.id}`);

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.create(dao);
    this.logger.log(`DAO successfully updated: ${receiverId}`);

    await this.eventService.sendProposalUpdateNotificationEvent(
      proposal,
      txAction,
    );
  }

  async handleActProposal(txAction: TransactionAction) {
    const { receiverId, signerId, transactionHash, args, timestamp } = txAction;
    const dao = await this.daoService.findOne(receiverId);
    const daoContract = this.nearApiService.getContract(
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

    switch (args.action) {
      case VoteAction.VoteApprove:
        return this.handleApproveProposal({
          dao,
          daoContract,
          proposal,
          receiverId,
          transactionHash,
          timestamp,
        });

      case VoteAction.VoteReject:
        return this.handleRejectProposal({
          dao,
          proposal,
          receiverId,
          transactionHash,
          timestamp,
        });

      case VoteAction.RemoveProposal:
      case VoteAction.VoteRemove:
        await this.handleRemoveProposal({
          dao,
          proposal,
          receiverId,
          transactionHash,
          timestamp,
          args,
        });
        break;

      default:
        await this.proposalService.create(proposal);
        break;
    }

    await this.eventService.sendProposalUpdateNotificationEvent(
      proposal,
      txAction,
    );
  }

  async handleApproveProposal({
    dao,
    daoContract,
    proposal,
    receiverId,
    transactionHash,
    timestamp,
  }) {
    const state = await this.nearApiService.getAccountState(receiverId);
    const proposalKindType = proposal.kind?.kind.type;
    let config;
    let policy;
    let stakingContract;
    let lastBountyId;

    if (proposal.status === ProposalStatus.Approved) {
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
      }

      if (proposalKindType === ProposalType.SetStakingContract) {
        stakingContract = await daoContract.get_staking_contract();
      }

      if (proposalKindType === ProposalType.BountyDone) {
        await this.handleDoneBounty({
          dao,
          daoContract,
          proposal,
          transactionHash,
          timestamp,
        });
      }

      if (proposalKindType === ProposalType.AddBounty) {
        lastBountyId = await daoContract.get_last_bounty_id();
        await this.handleAddBounty({
          dao,
          proposal,
          lastBountyId,
          transactionHash,
          timestamp,
        });
      }
    }

    this.logger.log(`Updating Proposal: ${proposal.id} due to transaction`);
    await this.proposalService.create(proposal);
    this.logger.log(`Proposal successfully updated: ${proposal.id}`);

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.create(
      castActProposalDao({
        dao,
        amount: state.amount,
        config,
        policy,
        lastBountyId,
        stakingContract,
        transactionHash,
        timestamp,
      }),
    );
    this.logger.log(`DAO successfully updated: ${receiverId}`);
  }

  async handleRejectProposal({
    dao,
    proposal,
    receiverId,
    transactionHash,
    timestamp,
  }) {
    const state = await this.nearApiService.getAccountState(receiverId);

    this.logger.log(`Updating Proposal: ${proposal.id} due to transaction`);
    await this.proposalService.create(proposal);
    this.logger.log(`Proposal successfully updated: ${proposal.id}`);

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.create(
      castActProposalDao({
        dao,
        amount: state.amount,
        transactionHash,
        timestamp,
      }),
    );
    this.logger.log(`DAO successfully updated: ${receiverId}`);
  }

  async handleRemoveProposal({
    dao,
    proposal,
    receiverId,
    transactionHash,
    args,
    timestamp,
  }) {
    const state = await this.nearApiService.getAccountState(receiverId);

    if (!proposal) {
      this.logger.log(`Removing Proposal: ${args.id} due to transaction`);
      await this.proposalService.remove(buildProposalId(receiverId, args.id));
    } else {
      this.logger.log(`Updating Proposal: ${proposal.id} due to transaction`);
      await this.proposalService.create(proposal);
      this.logger.log(`Successfully updated Proposal: ${proposal.id}`);
    }

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.create(
      castActProposalDao({
        dao,
        amount: state.amount,
        transactionHash,
        timestamp,
      }),
    );
    this.logger.log(`DAO successfully updated: ${receiverId}`);
  }

  async handleAddBounty({
    dao,
    proposal,
    lastBountyId,
    transactionHash,
    timestamp,
  }) {
    const bountyData = proposal.kind?.kind.bounty;
    const bountyId = await this.findLastBountyId(
      dao.id,
      lastBountyId,
      bountyData,
    );
    const bounty = await this.bountyService.findOne({
      id: buildBountyId(dao.id, bountyId),
    });

    if (bounty) {
      this.logger.log('Bounty has already been created');
      return;
    }

    this.logger.log('Storing new Bounty due to transaction');
    await this.bountyService.create(
      castAddBounty({
        dao,
        bounty: bountyData,
        bountyId,
        transactionHash,
        timestamp,
      }),
    );
    this.logger.log('Successfully stored new Bounty');
  }

  async handleDoneBounty({
    dao,
    daoContract,
    proposal,
    transactionHash,
    timestamp,
  }) {
    const { bountyId, receiverId } = proposal.kind.kind;
    const bounty = await this.bountyService.findOne(
      buildBountyId(dao.id, bountyId),
      { relations: ['bountyClaims'] },
    );

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
  }

  async handleClaimUnclaimBounty({
    receiverId,
    signerId,
    transactionHash,
    args,
    timestamp,
  }: TransactionAction) {
    const daoContract = this.nearApiService.getContract(
      'sputnikDao',
      receiverId,
    );
    const { id } = args;
    const bounty = await this.bountyService.findOne(
      buildBountyId(receiverId, id),
      { relations: ['bountyClaims'] },
    );

    const bountyClaims = await daoContract.get_bounty_claims({
      account_id: signerId,
    });
    const numberOfClaims = await daoContract.get_bounty_number_of_claims({
      id: bounty.bountyId,
    });

    this.logger.log(`Updating Bounty: ${bounty.id} due to transaction`);
    await this.bountyService.create(
      castClaimBounty({
        bounty,
        accountId: signerId,
        transactionHash,
        bountyClaims,
        numberOfClaims,
        timestamp,
      }),
    );
    this.logger.log(`Bounty successfully updated: ${bounty.id}`);
  }

  async handleUnknownDaoTransaction({ receiverId }: TransactionAction) {
    const dao = await this.daoService.findOne(receiverId);
    const state = await this.nearApiService.getAccountState(receiverId);

    dao.amount = Number(state.amount);

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.create({ ...dao });
    this.logger.log(`DAO successfully updated: ${receiverId}`);
  }

  // TODO: Optimize this logic
  private async findLastBountyId(
    daoId: string,
    lastBountyId: number,
    bountyData,
  ): Promise<string | undefined> {
    const daoContract = this.nearApiService.getContract('sputnikDao', daoId);
    const chunkSize = 50;
    const chunkCount =
      (lastBountyId - (lastBountyId % chunkSize)) / chunkSize + 1;
    let bounties = [];

    for (let i = 0; i < chunkCount; i++) {
      const bountiesChunk = await daoContract.get_bounties({
        from_index: chunkSize * i,
        limit: chunkSize,
      });
      bounties = bounties.concat(bountiesChunk);
    }

    return bounties
      .reverse()
      .find(({ description, token, amount, times, max_deadline }) => {
        return (
          description === bountyData.description &&
          token === bountyData.token &&
          amount === bountyData.amount &&
          times === bountyData.times &&
          max_deadline === bountyData.maxDeadline
        );
      })?.id;
  }

  // TODO: Optimize this logic
  private async findLastProposal(
    daoId: string,
    proposerId: string,
    lastProposalId: number,
    proposalData,
  ) {
    const daoContract = this.nearApiService.getContract('sputnikDao', daoId);
    const chunkSize = 50;
    const chunkCount =
      (lastProposalId - (lastProposalId % chunkSize)) / chunkSize + 1;
    let proposals = [];

    // Load all proposals by chunks
    for (let i = 0; i < chunkCount; i++) {
      const proposalsChunk = await daoContract.get_proposals({
        from_index: chunkSize * i,
        limit: chunkSize,
      });
      proposals = proposals.concat(proposalsChunk);
    }

    return proposals.reverse().find(({ description, proposer, kind }) => {
      const hasSameKind =
        typeof kind === 'string'
          ? kind === proposalData.kind
          : Object.keys(kind).toString() ===
            Object.keys(proposalData.kind).toString();
      return (
        description === proposalData.description &&
        proposerId === proposer &&
        hasSameKind
      );
    });
  }

  private getContractHandlers(receiverId: string): ContractHandler[] {
    return this.contractHandlers.filter((contractHandler) => {
      return (
        contractHandler.contractId === receiverId ||
        receiverId.endsWith(contractHandler.contractIdSuffix)
      );
    });
  }
}
