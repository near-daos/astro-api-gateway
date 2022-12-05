import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dao } from '@sputnik-v2/dao';
import {
  DaoModel,
  DynamodbService,
  DynamoEntityType,
} from '@sputnik-v2/dynamodb';
import PromisePool from '@supercharge/promise-pool';
import { FindManyOptions, MongoRepository, Repository } from 'typeorm';

import { Migration } from '..';

@Injectable()
export class DynamoCheckMigration implements Migration {
  private readonly logger = new Logger(DynamoCheckMigration.name);

  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
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
        relations: ['policy', 'daoVersion'],
      },
    )) {
      await PromisePool.withConcurrency(20)
        .for(daos)
        .handleError((err, dao) => {
          this.logger.warn(`Dao ${dao.id} check failed: ${err}`);
        })
        .process(async (dao) => {
          return this.checkDao(dao);
        });
    }
  }

  async checkDao(dao: Dao) {
    this.logger.log(`Checking dao ${dao.id}`);

    const daoModel = await this.dynamodbService.getItemByType<DaoModel>(
      dao.id,
      DynamoEntityType.Dao,
      dao.id,
    );

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
      isArchived: dao.isArchived,
      createTimestamp: dao.createTimestamp,
      updateTimestamp: dao.updateTimestamp,
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
      isArchived: daoModel.isArchived,
      createTimestamp: daoModel.createTimestamp,
      updateTimestamp: daoModel.updateTimestamp,
      // createdAt: daoModel.creatingTimeStamp,
      // updateAt: daoModel.processingTimeStamp,
    };

    this.deepCompare(
      daoProperties,
      daoModelProperties,
      'daoEntity',
      'daoModel',
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
