import { Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinalExecutionStatus } from 'near-api-js/lib/providers';

import { NearApiService } from '@sputnik-v2/near-api';
import { SputnikService } from '@sputnik-v2/sputnikdao';
import { DaoService } from '@sputnik-v2/dao';
import {
  ProposalKindBountyDone,
  ProposalService,
  ProposalStatus,
  ProposalType,
} from '@sputnik-v2/proposal';
import { Transaction } from '@sputnik-v2/near-indexer';
import { BountyContextService, BountyService } from '@sputnik-v2/bounty';
import { EventService } from '@sputnik-v2/event';
import { btoaJSON, buildBountyId, buildProposalId } from '@sputnik-v2/utils';

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
  TransactionAction,
  VoteAction,
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
    private readonly sputnikService: SputnikService,
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
    private readonly bountyService: BountyService,
    private readonly bountyContextService: BountyContextService,
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

  async handleTransactionActions(
    actions: TransactionAction[],
  ): Promise<string[]> {
    const handledTxHashes = [];

    // Actions are handled one by one to keep order of transactions
    for (const action of actions) {
      try {
        await this.handleTransactionAction(action);
        handledTxHashes.push(action.transactionHash);
      } catch (error) {
        this.logger.error(
          `Failed to handle transaction ${action.transactionHash} with error: ${error}`,
        );

        // If some action failed stop handling
        return handledTxHashes;
      }
    }

    return handledTxHashes;
  }

  async handleTransactionAction(action: TransactionAction) {
    this.logger.log(`Handling transaction: ${action.transactionHash}`);

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

    const { errors } = await PromisePool.for(contractHandlers).process(
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
      this.logger.error(`Handling transaction failed with errors:`);
      errors.forEach((error) => {
        this.logger.error(error);
      });
    } else {
      this.logger.log(
        `Transaction successfully handled: ${action.transactionHash}`,
      );
    }
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
    await this.daoService.saveWithFunds(dao);
    await this.daoService.setDaoVersion(daoId);
    this.logger.log(`Successfully stored new DAO: ${daoId}`);

    await this.eventService.sendDaoUpdateNotificationEvent(dao, txAction);
  }

  async handleAddProposal(txAction: TransactionAction) {
    const { receiverId, signerId, transactionHash, timestamp } = txAction;

    const txStatus = await this.nearApiService.getTxStatus(
      transactionHash,
      receiverId,
    );

    const lastProposalId = parseInt(
      (txStatus.status as FinalExecutionStatus)?.SuccessValue,
    );

    if (isNaN(lastProposalId)) {
      this.logger.warn(
        `Error getting Proposal ID from transaction: ${transactionHash}`,
      );
      return;
    }

    const daoEntity = await this.daoService.findOne(receiverId);
    const daoProposal = await this.sputnikService.getProposal(
      receiverId,
      lastProposalId,
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

    if (proposal.type === ProposalType.BountyDone) {
      const proposalKind = proposal.kind.kind as ProposalKindBountyDone;
      const bountyClaim = await this.bountyService.getLastBountyClaim(
        buildBountyId(dao.id, proposalKind.bountyId),
        proposalKind.receiverId,
        timestamp,
      );
      proposal.bountyClaimId = bountyClaim.id;
    }

    this.logger.log(`Storing Proposal: ${proposal.id} due to transaction`);
    await this.proposalService.create(proposal);
    this.logger.log(`Successfully stored Proposal: ${proposal.id}`);

    if (proposal.type === ProposalType.AddBounty) {
      this.logger.log(
        `Storing Bounty Context: ${proposal.id} due to transaction`,
      );
      await this.bountyContextService.create({
        id: proposal.id,
        daoId: proposal.daoId,
      });
      this.logger.log(`Successfully stored Bounty Context: ${proposal.id}`);
    }

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.saveWithProposalCount(dao);
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
    const proposalEntity = await this.proposalService.findOne(
      buildProposalId(receiverId, args.id),
    );

    switch (args.action) {
      case VoteAction.VoteApprove:
        await this.handleApproveProposal({
          dao,
          daoContract,
          proposal,
          receiverId,
          transactionHash,
          timestamp,
        });
        break;

      case VoteAction.Finalize:
      case VoteAction.VoteReject:
        await this.handleRejectProposal({
          dao,
          daoContract,
          proposal,
          receiverId,
          transactionHash,
          timestamp,
        });
        break;

      case VoteAction.RemoveProposal:
      case VoteAction.VoteRemove:
        await this.handleRemoveProposal({
          dao,
          daoContract,
          proposal,
          proposalEntity,
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
      proposal || proposalEntity,
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
    let daoVersion;
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
          proposalKind: proposal.kind.kind,
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

      if (proposalKindType === ProposalType.UpgradeSelf) {
        daoVersion = await this.daoService.getDaoVersionById(dao.id);
      }
    }

    this.logger.log(`Updating Proposal: ${proposal.id} due to transaction`);
    await this.proposalService.create(proposal);
    this.logger.log(`Proposal successfully updated: ${proposal.id}`);

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.saveWithAdditionalFields(
      castActProposalDao({
        dao,
        amount: state.amount,
        config,
        policy,
        daoVersion,
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
    daoContract,
    proposal,
    receiverId,
    transactionHash,
    timestamp,
  }) {
    const state = await this.nearApiService.getAccountState(receiverId);
    const proposalKindType = proposal.kind?.kind.type;

    if (
      (proposal.status === ProposalStatus.Rejected ||
        proposal.status === ProposalStatus.Expired) &&
      proposalKindType === ProposalType.BountyDone
    ) {
      await this.handleDoneBounty({
        dao,
        daoContract,
        proposalKind: proposal.kind.kind,
        transactionHash,
        timestamp,
      });
    }

    this.logger.log(`Updating Proposal: ${proposal.id} due to transaction`);
    await this.proposalService.create(proposal);
    this.logger.log(`Proposal successfully updated: ${proposal.id}`);

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.saveWithProposalCount(
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
    daoContract,
    proposal,
    proposalEntity,
    receiverId,
    transactionHash,
    args,
    timestamp,
  }) {
    const state = await this.nearApiService.getAccountState(receiverId);

    if (!proposal) {
      const proposalKindType = proposalEntity?.kind?.type;

      if (proposalKindType === ProposalType.BountyDone) {
        await this.handleDoneBounty({
          dao,
          daoContract,
          proposalKind: proposalEntity?.kind,
          transactionHash,
          timestamp,
        });
      }

      this.logger.log(`Removing Proposal: ${args.id} due to transaction`);
      await this.proposalService.remove(proposalEntity.id);
    } else {
      this.logger.log(`Updating Proposal: ${proposal.id} due to transaction`);
      await this.proposalService.create(proposal);
      this.logger.log(`Successfully updated Proposal: ${proposal.id}`);
    }

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.saveWithProposalCount(
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
    const daoBounty = await this.sputnikService.findLastBounty(
      dao.id,
      lastBountyId,
      bountyData,
    );
    const bountyId = daoBounty?.id;
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
        proposal,
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
    proposalKind,
    transactionHash,
    timestamp,
  }) {
    const { bountyId, receiverId } = proposalKind;
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
    methodName,
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
        transactionHash,
        bountyClaims,
        numberOfClaims,
        removedClaim: getRemovedClaim(),
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
    await this.daoService.saveWithFunds({ ...dao });
    this.logger.log(`DAO successfully updated: ${receiverId}`);
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
