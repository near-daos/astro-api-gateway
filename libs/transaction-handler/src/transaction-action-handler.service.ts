import { Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';
import { ConfigService } from '@nestjs/config';
import { NearApiService } from '@sputnik-v2/near-api';
import { DaoService } from '@sputnik-v2/dao';
import {
  ProposalService,
  ProposalStatus,
  ProposalType,
} from '@sputnik-v2/proposal';
import { BountyService } from '@sputnik-v2/bounty';
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
} from './types';

@Injectable()
export class TransactionActionHandlerService {
  private readonly logger = new Logger(TransactionActionHandlerService.name);

  private contractHandlers: ContractHandler[];

  constructor(
    private readonly configService: ConfigService,
    private readonly nearApiService: NearApiService,
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
    private readonly bountyService: BountyService,
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
    const contractHandlers = this.getContractHandlers(action.receiverId);
    await PromisePool.for(contractHandlers).process(async (contractHandler) => {
      const handler = contractHandler.methodHandlers[action.methodName];
      if (handler) {
        return handler(action);
      }
    });
  }

  async handleCreateDao({
    signerId,
    transactionHash,
    args,
    timestamp,
  }: TransactionAction) {
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
  }

  async handleAddProposal({
    receiverId,
    signerId,
    transactionHash,
    args,
    timestamp,
  }: TransactionAction) {
    const daoEntity = await this.daoService.findOne(receiverId);
    const proposal = castCreateProposal({
      transactionHash,
      signerId,
      proposal: args.proposal,
      dao: daoEntity,
      timestamp,
    });
    const dao = castAddProposalDao({
      dao: daoEntity,
      transactionHash,
      timestamp,
    });

    this.logger.log(`Storing Proposal: ${proposal.id} due to transaction`);
    await this.proposalService.create(proposal);
    this.logger.log(`Successfully stored Proposal: ${proposal.id}`);

    this.logger.log(`Updating DAO: ${receiverId} due to transaction`);
    await this.daoService.create(dao);
    this.logger.log(`DAO successfully updated: ${receiverId}`);
  }

  async handleActProposal({
    receiverId,
    signerId,
    transactionHash,
    args,
    timestamp,
  }: TransactionAction) {
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
        action: args.action
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

      if (proposalKindType === ProposalType.AddBounty) {
        await this.handleAddBounty({
          dao,
          proposal,
          transactionHash,
          timestamp,
        });
        lastBountyId = await daoContract.get_last_bounty_id();
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
      this.logger.log(`Removing Proposal: ${proposal.id} due to transaction`);
      await this.proposalService.create(proposal);
      this.logger.log(`successfully updated Proposal: ${proposal.id}`);
      await this.proposalService.remove(buildProposalId(receiverId, args.id));
    } else {
      this.logger.log(`Updating Proposal: ${proposal.id} due to transaction`);
      await this.proposalService.create(proposal);
      this.logger.log(`successfully updated Proposal: ${proposal.id}`);
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

  async handleAddBounty({ dao, proposal, transactionHash, timestamp }) {
    this.logger.log('Storing new Bounty due to transaction');
    await this.bountyService.create(
      castAddBounty({ dao, proposal, transactionHash, timestamp }),
    );
    this.logger.log('Successfully stored new Bounty');
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

    this.logger.log(`Updating Bounty: ${bounty.id} due to transaction`);
    await this.bountyService.create(
      castClaimBounty({
        bounty,
        accountId: signerId,
        transactionHash,
        bountyClaims,
        timestamp,
      }),
    );
    this.logger.log(`Bounty successfully updated: ${bounty.id}`);
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
