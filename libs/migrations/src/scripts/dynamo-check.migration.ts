import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bounty } from '@sputnik-v2/bounty';
import { Dao } from '@sputnik-v2/dao';
import {
  BountyModel,
  DaoModel,
  DynamodbService,
  DynamoEntityType,
  ProposalModel,
} from '@sputnik-v2/dynamodb';
import { Proposal } from '@sputnik-v2/proposal';
import { TokenBalance } from '@sputnik-v2/token';
import { parseProposalIndex } from '@sputnik-v2/transaction-handler';
import PromisePool from '@supercharge/promise-pool';
import { FindManyOptions, MongoRepository, Repository } from 'typeorm';

import { Migration } from '..';

@Injectable()
export class DynamoCheckMigration implements Migration {
  private readonly logger = new Logger(DynamoCheckMigration.name);

  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
    @InjectRepository(Bounty)
    private readonly bountyRepository: Repository<Bounty>,
    @InjectRepository(TokenBalance)
    private readonly tokenBalanceRepository: Repository<TokenBalance>,
    private readonly dynamodbService: DynamodbService,
  ) {}

  async migrate(): Promise<void> {
    this.logger.log(`Dynamo Checker started...`);

    await this.checkDaos();

    this.logger.log(`Dynamo checker finished.`);
  }

  private async *getEntities<E>(
    repo: Repository<E> | MongoRepository<E>,
    findParams?: FindManyOptions<E>,
    startFrom = 0,
    chunkSize = 100,
  ): AsyncGenerator<E[]> {
    for (let start = startFrom; ; start += chunkSize) {
      const chunk = await repo.find({
        take: chunkSize,
        skip: start,
        loadEagerRelations: false,
        ...findParams,
      });

      yield chunk;

      if (chunk.length !== chunkSize) {
        break;
      }
    }
  }

  private async *checkEntity<E>(
    entity: string,
    repo: Repository<E> | MongoRepository<E>,
    findParams?: FindManyOptions<E>,
    startFrom = 0,
  ): AsyncGenerator<E[]> {
    this.logger.log(`Checking ${entity}...`);

    const totalCount = await repo.count();

    let count = startFrom;

    for await (const entities of this.getEntities(
      repo,
      findParams,
      startFrom,
    )) {
      count += entities.length;

      this.logger.log(`Checking ${entity}: chunk ${count}/${totalCount}`);

      yield entities;
    }

    this.logger.log(`Checked ${entity}: ${count}. Finished.`);
  }

  private async checkDaos() {
    for await (const daos of this.checkEntity<Dao>(
      Dao.name,
      this.daoRepository,
      {
        relations: ['policy', 'policy.roles', 'daoVersion'],
      },
    )) {
      await PromisePool.withConcurrency(5)
        .for(daos)
        .handleError((err, dao) => {
          this.logger.warn(`Dao ${dao.id} check failed: ${err} (${err.stack})`);
        })
        .process(async (dao) => {
          return this.checkDao(dao);
        });
    }
  }

  async checkDao(dao: Dao) {
    this.logger.log(`Checking dao ${dao.id}`);

    const tokenBalances = await this.tokenBalanceRepository.find({
      where: {
        accountId: dao.id,
      },
      loadEagerRelations: false,
      relations: ['token'],
    });

    const daoModel = await this.dynamodbService.getItemByType<DaoModel>(
      dao.id,
      DynamoEntityType.Dao,
      dao.id,
    );

    if (!daoModel) {
      throw new Error(`Dao model not found: ${dao.id}`);
    }

    const daoProperties = {
      id: dao.id,
      config: dao.config,
      metadata: dao.metadata,
      amount: dao.amount,
      totalSupply: dao.totalSupply,
      lastBountyId: dao.lastBountyId,
      lastProposalId: dao.lastProposalId,
      stakingContract: dao.stakingContract,
      numberOfAssociates: dao.numberOfAssociates,
      numberOfMembers: dao.numberOfMembers,
      numberOfGroups: dao.numberOfGroups,
      council: dao.council,
      accountIds: dao.accountIds,
      tokens: tokenBalances
        ? tokenBalances
            .map((tokenBalance) => ({
              tokenId: tokenBalance.tokenId,
              accountId: tokenBalance.accountId,
              balance: tokenBalance.balance,
              id: tokenBalance.token?.id,
              ownerId: tokenBalance.token?.ownerId,
              totalSupply: tokenBalance.token?.totalSupply,
              decimals: tokenBalance.token?.decimals,
              icon: tokenBalance.token?.icon,
              name: tokenBalance.token?.name,
              reference: tokenBalance.token?.reference,
              referenceHash: tokenBalance.token?.referenceHash,
              spec: tokenBalance.token?.spec,
              symbol: tokenBalance.token?.symbol,
              price: tokenBalance.token?.price,
            }))
            .sort((a, b) => a.id.localeCompare(b.id))
        : [],
      councilSeats: dao.councilSeats,
      policy: {
        proposalBond: dao.policy?.proposalBond,
        bountyBond: dao.policy?.bountyBond,
        proposalPeriod: dao.policy?.proposalPeriod,
        bountyForgivenessPeriod: dao.policy?.bountyForgivenessPeriod,
        defaultVotePolicy: dao.policy?.defaultVotePolicy,
        roles: dao.policy?.roles
          ? dao.policy.roles
              .map((role) => ({
                id: role.id,
                name: role.name,
                kind: role.kind,
                balance: role.balance,
                accountIds: role.accountIds,
                permissions: role.permissions,
                votePolicy: role.votePolicy,
              }))
              .sort((a, b) => a.name.localeCompare(b.name))
          : [],
      },
      link: dao.link,
      description: dao.description,
      createdBy: dao.createdBy,
      daoVersionHash: dao.daoVersionHash,
      daoVersion: {
        hash: dao.daoVersion?.hash,
        version: dao.daoVersion?.version,
        commitId: dao.daoVersion?.commitId,
        changelogUrl: dao.daoVersion?.changelogUrl,
      },
      status: dao.status,
      activeProposalCount: dao.activeProposalCount,
      totalProposalCount: dao.totalProposalCount,
      totalDaoFunds: dao.totalDaoFunds,
      bountyCount: dao.bountyCount,
      nftCount: dao.nftCount,
      transactionHash: dao.transactionHash,
      updateTransactionHash: dao.updateTransactionHash,
      createTimestamp: dao.createTimestamp,
      updateTimestamp: dao.updateTimestamp,
      isArchived: dao.isArchived,
      // createdAt: dao.createdAt.getTime(),
      // updateAt: dao.updatedAt.getTime(),
    };

    const daoModelProperties = {
      id: daoModel.id,
      config: daoModel.config,
      metadata: daoModel.metadata,
      amount: daoModel.amount,
      totalSupply: daoModel.totalSupply,
      lastBountyId: daoModel.lastBountyId,
      lastProposalId: daoModel.lastProposalId,
      stakingContract: daoModel.stakingContract,
      numberOfAssociates: daoModel.numberOfAssociates,
      numberOfMembers: daoModel.numberOfMembers,
      numberOfGroups: daoModel.numberOfGroups,
      council: daoModel.council,
      accountIds: daoModel.accountIds,
      tokens: daoModel.tokens
        ? daoModel.tokens
            .map((tokenBalanceModel) => ({
              tokenId: tokenBalanceModel.tokenId,
              accountId: tokenBalanceModel.accountId,
              balance: tokenBalanceModel.balance,
              id: tokenBalanceModel.id,
              ownerId: tokenBalanceModel.ownerId,
              totalSupply: tokenBalanceModel.totalSupply,
              decimals: tokenBalanceModel.decimals,
              icon: tokenBalanceModel.icon,
              name: tokenBalanceModel.name,
              reference: tokenBalanceModel.reference,
              referenceHash: tokenBalanceModel.referenceHash,
              spec: tokenBalanceModel.spec,
              symbol: tokenBalanceModel.symbol,
              price: tokenBalanceModel.price,
            }))
            .sort((a, b) => a.id.localeCompare(b.id))
        : [],
      councilSeats: daoModel.councilSeats,
      policy: {
        proposalBond: daoModel.policy?.proposalBond,
        bountyBond: daoModel.policy?.bountyBond,
        proposalPeriod: daoModel.policy?.proposalPeriod,
        bountyForgivenessPeriod: daoModel.policy?.bountyForgivenessPeriod,
        defaultVotePolicy: daoModel.policy?.defaultVotePolicy,
        roles: daoModel.policy?.roles
          ? daoModel.policy.roles
              .map((roleModel) => ({
                id: roleModel.id,
                name: roleModel.name,
                kind: roleModel.kind,
                balance: roleModel.balance,
                accountIds: roleModel.accountIds,
                permissions: roleModel.permissions,
                votePolicy: roleModel.votePolicy,
              }))
              .sort((a, b) => a.name.localeCompare(b.name))
          : [],
      },
      link: daoModel.link,
      description: daoModel.description,
      createdBy: daoModel.createdBy,
      daoVersionHash: daoModel.daoVersion?.hash,
      daoVersion: {
        hash: daoModel.daoVersion?.hash,
        version: daoModel.daoVersion?.version,
        commitId: daoModel.daoVersion?.commitId,
        changelogUrl: daoModel.daoVersion?.changelogUrl,
      },
      status: daoModel.status,
      activeProposalCount: daoModel.activeProposalCount,
      totalProposalCount: daoModel.totalProposalCount,
      totalDaoFunds: daoModel.totalDaoFunds,
      bountyCount: daoModel.bountyCount,
      nftCount: daoModel.nftCount,
      transactionHash: daoModel.transactionHash,
      updateTransactionHash: daoModel.updateTransactionHash,
      createTimestamp: daoModel.createTimestamp,
      updateTimestamp: daoModel.updateTimestamp,
      isArchived: daoModel.isArchived,
      // createdAt: daoModel.creatingTimeStamp,
      // updateAt: daoModel.processingTimeStamp,
    };

    this.deepCompare(
      daoProperties,
      daoModelProperties,
      'daoEntity',
      'daoModel',
    );

    const proposals = await this.proposalRepository.find({
      where: {
        daoId: dao.id,
      },
      loadEagerRelations: false,
      relations: ['actions'],
    });

    await PromisePool.withConcurrency(5)
      .for(proposals)
      .handleError((err) => {
        this.logger.warn(`Dao ${dao.id} check failed: ${err} (${err.stack})`);
      })
      .process((proposal) => {
        return this.checkProposal(proposal);
      });

    const bounties = await this.bountyRepository.find({
      where: {
        daoId: dao.id,
      },
      loadEagerRelations: false,
      relations: ['bountyDoneProposals', 'bountyClaims'],
    });

    await PromisePool.withConcurrency(5)
      .for(bounties)
      .handleError((err) => {
        this.logger.warn(
          `Bounty ${dao.id} check failed: ${err} (${err.stack})`,
        );
      })
      .process((bounty) => {
        return this.checkBounty(bounty);
      });
  }

  async checkProposal(proposal: Proposal) {
    this.logger.log(`Checking proposal ${proposal.id}`);

    const proposalModel =
      await this.dynamodbService.getItemByType<ProposalModel>(
        proposal.daoId,
        DynamoEntityType.Proposal,
        String(proposal.proposalId),
      );

    if (!proposalModel) {
      throw new Error(`Proposal model not found: ${proposal.id}`);
    }

    const proposalProperties = {
      id: proposal.id,
      daoId: proposal.daoId,
      proposer: proposal.proposer,
      description: proposal.description,
      status: proposal.status,
      voteStatus: proposal.voteStatus,
      kind: proposal.kind,
      type: proposal.type,
      policyLabel: proposal.policyLabel,
      submissionTime: proposal.submissionTime,
      voteCounts: proposal.voteCounts,
      votes: proposal.votes,
      failure: proposal.failure,
      actions: proposal.actions
        ? proposal.actions.map((action) => ({
            id: action.id,
            proposalId: action.proposalId,
            accountId: action.accountId,
            action: action.action,
            transactionHash: action.transactionHash,
            timestamp: action.timestamp,
          }))
        : [],
      votePeriodEnd: proposal.votePeriodEnd,
      bountyDoneId: proposal.bountyDoneId,
      bountyClaimId: proposal.bountyClaimId,
      commentsCount: proposal.commentsCount,
      transactionHash: proposal.transactionHash,
      updateTransactionHash: proposal.updateTransactionHash,
      createTimestamp: proposal.createTimestamp,
      updateTimestamp: proposal.updateTimestamp,
      isArchived: proposal.isArchived,
      // createdAt: proposal.createdAt.getTime(),
      // updateAt: proposal.updatedAt.getTime(),
    };

    const proposalModelProperties = {
      id: proposalModel.id,
      daoId: proposalModel.partitionId,
      proposer: proposalModel.proposer,
      description: proposalModel.description,
      status: proposalModel.status,
      voteStatus: proposalModel.voteStatus,
      kind: proposalModel.kind,
      type: proposalModel.type,
      policyLabel: proposalModel.policyLabel,
      submissionTime: proposalModel.submissionTime,
      voteCounts: proposalModel.voteCounts,
      votes: proposalModel.votes,
      failure: proposalModel.failure,
      actions: proposalModel.actions
        ? proposalModel.actions.map((actionModel) => ({
            id: actionModel.id,
            proposalId: actionModel.proposalId,
            accountId: actionModel.accountId,
            action: actionModel.action,
            transactionHash: actionModel.transactionHash,
            timestamp: actionModel.timestamp,
          }))
        : [],
      votePeriodEnd: proposalModel.votePeriodEnd,
      bountyDoneId: proposalModel.bountyDoneId,
      bountyClaimId: proposalModel.bountyClaimId,
      commentsCount: proposalModel.commentsCount,
      transactionHash: proposalModel.transactionHash,
      updateTransactionHash: proposalModel.updateTransactionHash,
      createTimestamp: proposalModel.createTimestamp,
      updateTimestamp: proposalModel.updateTimestamp,
      isArchived: proposalModel.isArchived,
      // createdAt: proposalModel.createdAt.getTime(),
      // updateAt: proposalModel.updatedAt.getTime(),
    };

    this.deepCompare(
      proposalProperties,
      proposalModelProperties,
      'proposalEntity',
      'proposalModel',
    );
  }

  async checkBounty(bounty: Bounty) {
    this.logger.log(`Checking bounty ${bounty.id}`);

    const proposalIndex = parseProposalIndex(bounty.proposalId);

    const bountyModel = await this.dynamodbService.getItemByType<BountyModel>(
      bounty.daoId,
      DynamoEntityType.Proposal,
      String(proposalIndex),
    );

    if (!bountyModel) {
      throw new Error(`Bounty model not found: ${bountyModel.id}`);
    }

    const bountyProperties = {
      id: bounty.id,
      bountyId: bounty.bountyId,
      proposalId: bounty.proposalId,
      daoId: bounty.daoId,
      bountyDoneProposalsIds: bounty.bountyDoneProposals
        ? bounty.bountyDoneProposals.map((proposal) => proposal.id)
        : [],
      bountyClaims: bounty.bountyClaims
        ? bounty.bountyClaims.map((bountyClaim) => ({
            id: bountyClaim.id,
            accountId: bountyClaim.accountId,
            startTime: bountyClaim.startTime,
            deadline: bountyClaim.deadline,
            completed: bountyClaim.completed,
            endTime: bountyClaim.endTime,
          }))
        : [],
      description: bounty.description,
      token: bounty.token,
      amount: bounty.amount,
      times: bounty.times,
      maxDeadline: bounty.maxDeadline,
      numberOfClaims: bounty.numberOfClaims,
      transactionHash: bounty.transactionHash,
      updateTransactionHash: bounty.updateTransactionHash,
      createTimestamp: bounty.createTimestamp,
      updateTimestamp: bounty.updateTimestamp,
      isArchived: bounty.isArchived,
      // createdAt: bounty.createdAt.getTime(),
      // updateAt: bounty.updatedAt.getTime(),
    };

    const bountyModelProperties = {
      id: bountyModel.id,
      bountyId: bountyModel.bountyId,
      proposalId: bountyModel.proposalId,
      daoId: bountyModel.daoId,
      bountyDoneProposalsIds: bountyModel.bountyDoneProposalIds,
      bountyClaims: bountyModel.bountyClaims
        ? bounty.bountyClaims.map((bountyClaimModel) => ({
            id: bountyClaimModel.id,
            accountId: bountyClaimModel.accountId,
            startTime: bountyClaimModel.startTime,
            deadline: bountyClaimModel.deadline,
            completed: bountyClaimModel.completed,
            endTime: bountyClaimModel.endTime,
          }))
        : [],
      description: bountyModel.description,
      token: bountyModel.token,
      amount: bountyModel.amount,
      times: bountyModel.times,
      maxDeadline: bountyModel.maxDeadline,
      numberOfClaims: bountyModel.numberOfClaims,
      transactionHash: bountyModel.transactionHash,
      updateTransactionHash: bountyModel.updateTransactionHash,
      createTimestamp: bountyModel.createTimestamp,
      updateTimestamp: bountyModel.updateTimestamp,
      isArchived: bountyModel.isArchived,
      // createdAt: bountyModel.createdAt.getTime(),
      // updateAt: bountyModel.updatedAt.getTime(),
    };

    this.deepCompare(
      bountyProperties,
      bountyModelProperties,
      'bountyEntity',
      'bountyModel',
    );
  }

  private deepCompare(a: any, b: any, aName = 'a', bName = 'b', path = []) {
    if (a === b) {
      return;
    }

    if (a && b && typeof a == 'object' && typeof b == 'object') {
      if (Array.isArray(a)) {
        const length = Math.max(a.length, b.length);

        for (let i = 0; i < length; i++) {
          this.deepCompare(a[i], b[i], aName, bName, path.concat(i));
        }

        return;
      } else {
        const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];

        for (const key of keys) {
          this.deepCompare(a[key], b[key], aName, bName, path.concat(key));
        }

        return;
      }
    }

    if ((a === undefined || a === null) && (b === undefined || b === null)) {
      return;
    }

    if (isNaN(a) && isNaN(b)) {
      return;
    }

    const pathStr = path.length ? `.${path.join('.')}` : '';
    throw new Error(
      `${aName}${pathStr} !== ${bName}${pathStr} (${a} !== ${b})`,
    );
  }
}
