import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, MongoRepository, Repository } from 'typeorm';
import PromisePool from '@supercharge/promise-pool';
import {
  DynamodbService,
  mapAccountNotificationSettingsToAccountNotificationSettingsModel,
  mapAccountNotificationToAccountNotificationModel,
  mapAccountToAccountModel,
  mapBountyToBountyModel,
  mapCommentToCommentModel,
  mapDaoStatsToDaoStatsModel,
  mapDaoToDaoModel,
  mapDraftCommentToCommentModel,
  mapNftTokenToNftModel,
  mapProposalTemplateToProposalTemplateModel,
  mapProposalToProposalModel,
  mapSharedProposalTemplateToSharedProposalTemplateModel,
  mapSubscriptionToSubscriptionModel,
  mapTokenBalanceToTokenBalanceModel,
} from '@sputnik-v2/dynamodb';
import { Account } from '@sputnik-v2/account';
import {
  AccountNotification,
  AccountNotificationSettings,
} from '@sputnik-v2/notification';
import { Bounty } from '@sputnik-v2/bounty';
import { Comment } from '@sputnik-v2/comment';
import { DraftComment } from '@sputnik-v2/draft-comment';
import { Dao } from '@sputnik-v2/dao';
import { getChunkCount } from '@sputnik-v2/utils';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import { DaoStats } from '@sputnik-v2/stats';
import {
  DraftProposal,
  DraftProposalHistory,
} from '@sputnik-v2/draft-proposal';
import { NFTToken, TokenBalance } from '@sputnik-v2/token';
import { Proposal } from '@sputnik-v2/proposal';
import {
  ProposalTemplate,
  SharedProposalTemplate,
} from '@sputnik-v2/proposal-template';
import { Subscription } from '@sputnik-v2/subscription';

import { Migration } from '..';

@Injectable()
export class DynamoDataMigration implements Migration {
  private readonly logger = new Logger(DynamoDataMigration.name);

  constructor(
    private readonly dynamodbService: DynamodbService,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(AccountNotification)
    private readonly accountNotificationRepository: Repository<AccountNotification>,

    @InjectRepository(AccountNotificationSettings)
    private readonly accountNotificationSettingsRepository: Repository<AccountNotificationSettings>,

    @InjectRepository(Bounty)
    private readonly bountyRepository: Repository<Bounty>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(DraftComment, DRAFT_DB_CONNECTION)
    private draftCommentRepository: MongoRepository<DraftComment>,

    @InjectRepository(DraftProposal, DRAFT_DB_CONNECTION)
    private draftProposalRepository: MongoRepository<DraftProposal>,

    @InjectRepository(DraftProposalHistory, DRAFT_DB_CONNECTION)
    private draftProposalHistoryRepository: MongoRepository<DraftProposalHistory>,

    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,

    @InjectRepository(DaoStats)
    private readonly daoStatsRepository: Repository<DaoStats>,

    @InjectRepository(NFTToken)
    private readonly nftTokenRepository: Repository<NFTToken>,

    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,

    @InjectRepository(ProposalTemplate)
    private readonly proposalTemplateRepository: Repository<ProposalTemplate>,

    @InjectRepository(SharedProposalTemplate)
    private readonly sharedProposalTemplateRepository: Repository<SharedProposalTemplate>,

    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,

    @InjectRepository(TokenBalance)
    private readonly tokenBalanceRepository: Repository<TokenBalance>,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Dynamo Data migration...');

    await this.migrateAccounts();

    await this.migrateAccountNotificationSettings();

    await this.migrateComments();

    await this.migrateDaos();

    await this.migrateProposals();

    await this.migrateBounties();

    await this.migrateDaoStats();

    await this.migrateNfts();

    await this.migrateProposalTemplates();

    await this.migrateSharedProposalTemplates();

    await this.migrateSubscription();

    await this.migrateTokenBalances();

    await this.migrateDraftComments();

    await this.migrateDraftProposals();

    await this.migrateAccountNotifications();

    // TODO: Migrate ErrorEntity, OTP, TransactionHandlerState

    this.logger.log('Starting Dynamo Data migration finished.');
  }

  public async migrateAccounts(): Promise<void> {
    for await (const accounts of this.migrateEntity<Account>(
      Account.name,
      this.accountRepository,
    )) {
      await this.dynamodbService.batchPut(
        accounts.map((account) => mapAccountToAccountModel(account)),
      );
    }
  }

  public async migrateAccountNotifications(): Promise<void> {
    for await (const accountNotifications of this.migrateEntity<AccountNotification>(
      AccountNotification.name,
      this.accountNotificationRepository,
      {
        relations: ['notification'],
      },
    )) {
      await this.dynamodbService.batchPut(
        accountNotifications.map((accountNotification) =>
          mapAccountNotificationToAccountNotificationModel(accountNotification),
        ),
      );
    }
  }

  public async migrateAccountNotificationSettings(): Promise<void> {
    for await (const accountNotificationSettings of this.migrateEntity<AccountNotificationSettings>(
      AccountNotificationSettings.name,
      this.accountNotificationSettingsRepository,
    )) {
      await this.dynamodbService.batchPut(
        accountNotificationSettings.map((setting) =>
          mapAccountNotificationSettingsToAccountNotificationSettingsModel(
            setting,
          ),
        ),
      );
    }
  }

  public async migrateBounties(): Promise<void> {
    for await (const bounties of this.migrateEntity<Bounty>(
      Bounty.name,
      this.bountyRepository,
      {
        relations: [
          'bountyContext',
          'bountyContext.proposal',
          'bountyDoneProposals',
          'bountyClaims',
        ],
      },
    )) {
      await this.dynamodbService.batchPut(
        bounties
          .filter((bounty) => bounty.bountyContext)
          .map((bounty) => mapBountyToBountyModel(bounty)),
      );
    }
  }

  public async migrateComments(): Promise<void> {
    for await (const comments of this.migrateEntity<Comment>(
      Comment.name,
      this.commentRepository,
      {
        relations: ['reports'],
      },
    )) {
      await this.dynamodbService.batchPut(
        comments.map((comment) => mapCommentToCommentModel(comment)),
      );
    }
  }

  public async migrateDraftComments(): Promise<void> {
    for await (const comments of this.migrateEntity<DraftComment>(
      DraftComment.name,
      this.draftCommentRepository,
    )) {
      await this.dynamodbService.batchPut(
        comments.map((comment) => mapDraftCommentToCommentModel(comment)),
      );
    }
  }

  public async migrateDaos(): Promise<void> {
    for await (const daos of this.migrateEntity<Dao>(
      Dao.name,
      this.daoRepository,
      {
        relations: ['delegations', 'daoVersion', 'policy'],
      },
    )) {
      await this.dynamodbService.batchPut(
        daos.map((dao) => mapDaoToDaoModel(dao)),
      );
    }
  }

  public async migrateDaoStats(): Promise<void> {
    for await (const daoStats of this.migrateEntity<DaoStats>(
      DaoStats.name,
      this.daoStatsRepository,
    )) {
      await this.dynamodbService.batchPut(
        daoStats.map((stats) => mapDaoStatsToDaoStatsModel(stats)),
      );
    }
  }

  public async migrateDraftProposals(): Promise<void> {
    for await (const draftProposals of this.migrateEntity<DraftProposal>(
      DraftProposal.name,
      this.draftProposalRepository,
    )) {
      await PromisePool.withConcurrency(5)
        .for(draftProposals)
        .process(async (draftProposal) => {
          const history = await this.draftProposalHistoryRepository.find({
            where: { draftProposalId: { $eq: draftProposal.id } },
          });
          return await this.dynamodbService.saveDraftProposal(
            draftProposal,
            history,
          );
        });
    }
  }

  public async migrateNfts(): Promise<void> {
    for await (const nfts of this.migrateEntity<NFTToken>(
      NFTToken.name,
      this.nftTokenRepository,
      {
        relations: ['contract', 'metadata'],
      },
    )) {
      await this.dynamodbService.batchPut(
        nfts.map((nft) => mapNftTokenToNftModel(nft)),
      );
    }
  }

  public async migrateProposals(): Promise<void> {
    for await (const proposals of this.migrateEntity<Proposal>(
      Proposal.name,
      this.proposalRepository,
      {
        relations: ['actions'],
      },
    )) {
      await this.dynamodbService.batchPut(
        proposals.map((proposal) => mapProposalToProposalModel(proposal)),
      );
    }
  }

  public async migrateProposalTemplates(): Promise<void> {
    for await (const proposalTemplates of this.migrateEntity<ProposalTemplate>(
      ProposalTemplate.name,
      this.proposalTemplateRepository,
    )) {
      await this.dynamodbService.batchPut(
        proposalTemplates.map((proposalTemplate) =>
          mapProposalTemplateToProposalTemplateModel(proposalTemplate),
        ),
      );
    }
  }

  public async migrateSharedProposalTemplates(): Promise<void> {
    for await (const sharedProposalTemplates of this.migrateEntity<SharedProposalTemplate>(
      SharedProposalTemplate.name,
      this.sharedProposalTemplateRepository,
      {
        relations: ['daos'],
      },
    )) {
      await PromisePool.withConcurrency(2)
        .for(sharedProposalTemplates)
        .process(async (sharedProposalTemplate) => {
          return await this.dynamodbService.batchPut(
            sharedProposalTemplate.daos.map(({ id }) =>
              mapSharedProposalTemplateToSharedProposalTemplateModel(
                sharedProposalTemplate,
                id,
              ),
            ),
          );
        });
    }
  }

  public async migrateSubscription(): Promise<void> {
    for await (const subscriptions of this.migrateEntity<Subscription>(
      Subscription.name,
      this.subscriptionRepository,
    )) {
      await this.dynamodbService.batchPut(
        subscriptions.map((subscription) =>
          mapSubscriptionToSubscriptionModel(subscription),
        ),
      );
    }
  }

  public async migrateTokenBalances(): Promise<void> {
    for await (const tokenBalances of this.migrateEntity<TokenBalance>(
      TokenBalance.name,
      this.tokenBalanceRepository,
      {
        relations: ['token'],
      },
    )) {
      await this.dynamodbService.batchPut(
        tokenBalances.map((tokenBalance) =>
          mapTokenBalanceToTokenBalanceModel(tokenBalance),
        ),
      );
    }
  }

  private async *migrateEntity<E>(
    entity: string,
    repo: Repository<E> | MongoRepository<E>,
    findParams?: FindManyOptions<E>,
  ): AsyncGenerator<E[]> {
    this.logger.log(`Migrating ${entity}...`);

    const totalCount = await repo.count();

    let count = 0;
    for await (const entities of this.getEntities(repo, findParams)) {
      count += entities.length;

      this.logger.log(`Migrating ${entity}: chunk ${count}/${totalCount}`);

      yield entities;
    }

    this.logger.log(`Migrated ${entity}: ${count}. Finished.`);
  }

  private async *getEntities<E>(
    repo: Repository<E> | MongoRepository<E>,
    findParams?: FindManyOptions<E>,
  ): AsyncGenerator<E[]> {
    const chunkSize = 20;
    const count = await repo.count();
    const chunkCount = getChunkCount(BigInt(count), chunkSize);

    for (let i = 0; i < chunkCount; i++) {
      const chunk = await repo.find({
        take: chunkSize,
        skip: chunkSize * i,
        loadEagerRelations: false,
        ...findParams,
      });

      yield chunk;
    }
  }
}
