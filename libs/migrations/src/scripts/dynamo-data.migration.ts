import { DateTime } from 'luxon';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  MongoRepository,
  MoreThan,
  Repository,
} from 'typeorm';
import PromisePool from '@supercharge/promise-pool';
import {
  AccountModel,
  AccountNotificationModel,
  BountyModel,
  CommentModel,
  DaoIdsModel,
  DaoModel,
  DraftProposalModel,
  mapAccountNotificationToAccountNotificationModel,
  mapAccountToAccountModel,
  mapBountyToBountyModel,
  mapCommentToCommentModel,
  mapDaoIdsToDaoIdsModel,
  mapDaoStatsToDaoStatsModel,
  mapDaoToDaoModel,
  mapDraftCommentToCommentModel,
  mapDraftProposalToDraftProposalModel,
  mapNftTokenToNftModel,
  mapProposalTemplateToProposalTemplateModel,
  mapProposalToProposalModel,
  mapSharedProposalTemplateToSharedProposalTemplateModel,
  mapSubscriptionToSubscriptionModel,
  mapTokenToTokenPriceModel,
  NftModel,
  ProposalModel,
  ProposalTemplateModel,
  SharedProposalTemplateModel,
  SubscriptionModel,
  TokenPriceModel,
} from '@sputnik-v2/dynamodb/models';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import { TokenService } from '@sputnik-v2/token/token.service';
import { Account } from '@sputnik-v2/account/entities';
import {
  AccountNotification,
  AccountNotificationSettings,
} from '@sputnik-v2/notification/entities';
import { Bounty } from '@sputnik-v2/bounty/entities';
import { Comment } from '@sputnik-v2/comment/entities';
import { DraftComment } from '@sputnik-v2/draft-comment/entities';
import { Dao } from '@sputnik-v2/dao/entities';
import { getChunkCount } from '@sputnik-v2/utils';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import { DaoStats } from '@sputnik-v2/stats/entities';
import {
  DraftProposal,
  DraftProposalHistory,
} from '@sputnik-v2/draft-proposal/entities';
import { NFTToken, Token, TokenBalance } from '@sputnik-v2/token/entities';
import { Proposal } from '@sputnik-v2/proposal/entities';
import {
  ProposalTemplate,
  SharedProposalTemplate,
} from '@sputnik-v2/proposal-template/entities';
import { Subscription } from '@sputnik-v2/subscription/entities';

import { Migration } from '..';
import {
  AccountNotificationIdsDynamoService,
  AccountNotificationSettingsService,
} from '@sputnik-v2/notification';

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
    private readonly accountNotificationSettingsService: AccountNotificationSettingsService,

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

    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly tokenService: TokenService,

    private readonly accountNotificationIdsDynamoService: AccountNotificationIdsDynamoService,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Dynamo Data migration...');

    await this.migrateAccounts();

    await this.migrateAccountNotificationSettings();

    await this.migrateComments();

    await this.migrateDaos();

    await this.migrateDaoIds();

    await this.migrateProposals();

    await this.migrateBounties();

    await this.migrateDaoStats();

    await this.migrateNfts();

    await this.migrateProposalTemplates();

    await this.migrateSharedProposalTemplates();

    await this.migrateSubscription();

    await this.migrateTokenBalances();

    await this.migrateTokenPrices();

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
      await this.dynamodbService.batchPut<AccountModel>(
        accounts.map((account) => mapAccountToAccountModel(account)),
      );
    }
  }

  public async migrateAccountNotifications(): Promise<void> {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    for await (const accountNotifications of this.migrateEntity<AccountNotification>(
      AccountNotification.name,
      this.accountNotificationRepository,
      {
        where: { createdAt: MoreThan(twoWeeksAgo) },
        relations: ['notification'],
      },
    )) {
      await this.dynamodbService.batchPut<AccountNotificationModel>(
        accountNotifications.map((accountNotification) =>
          mapAccountNotificationToAccountNotificationModel(accountNotification),
        ),
      );
      await this.accountNotificationIdsDynamoService.setAccountsNotificationIds(
        accountNotifications,
      );
    }
  }

  public async migrateAccountNotificationSettings(): Promise<void> {
    for await (const accountNotificationSettings of this.migrateEntity<AccountNotificationSettings>(
      AccountNotificationSettings.name,
      this.accountNotificationSettingsRepository,
    )) {
      await PromisePool.withConcurrency(5)
        .for(accountNotificationSettings)
        .process(async (setting) => {
          return this.accountNotificationSettingsService.saveAccountNotificationSettings(
            setting,
          );
        });
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
      await this.dynamodbService.batchPut<BountyModel>(
        bounties
          .filter((bounty) => bounty.bountyContext)
          .map((bounty) =>
            mapBountyToBountyModel(
              bounty,
              bounty.bountyContext.proposal.proposalId,
            ),
          ),
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
      await this.dynamodbService.batchPut<CommentModel>(
        comments.map((comment) => mapCommentToCommentModel(comment)),
      );
    }
  }

  public async migrateDraftComments(): Promise<void> {
    for await (const comments of this.migrateEntity<DraftComment>(
      DraftComment.name,
      this.draftCommentRepository,
    )) {
      await this.dynamodbService.batchPut<CommentModel>(
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
      await this.dynamodbService.batchPut<DaoModel>(
        daos.map((dao) => mapDaoToDaoModel(dao)),
      );
    }
  }

  public async migrateDaoIds(): Promise<void> {
    const daos = await this.daoRepository.find({
      select: ['id'],
      loadEagerRelations: false,
    });
    await this.dynamodbService.saveItem<DaoIdsModel>(
      mapDaoIdsToDaoIdsModel(daos.map(({ id }) => id)),
    );
  }

  public async migrateDaoStats(): Promise<void> {
    for await (const daoStats of this.migrateEntity<DaoStats>(
      DaoStats.name,
      this.daoStatsRepository,
    )) {
      await this.dynamodbService.batchPut<DaoStats>(
        daoStats.map((stats) =>
          mapDaoStatsToDaoStatsModel({
            ...stats,
            // reset timestamp to start of day
            timestamp: DateTime.fromMillis(stats.timestamp)
              .startOf('day')
              .toMillis(),
          }),
        ),
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
          return this.dynamodbService.saveItem<DraftProposalModel>(
            mapDraftProposalToDraftProposalModel(draftProposal, history),
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
      await this.dynamodbService.batchPut<NftModel>(
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
      5540,
    )) {
      await this.dynamodbService.batchPut<ProposalModel>(
        proposals.map((proposal) => mapProposalToProposalModel(proposal)),
      );
    }
  }

  public async migrateProposalTemplates(): Promise<void> {
    for await (const proposalTemplates of this.migrateEntity<ProposalTemplate>(
      ProposalTemplate.name,
      this.proposalTemplateRepository,
    )) {
      await this.dynamodbService.batchPut<ProposalTemplateModel>(
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
      await this.dynamodbService.batchPut<SharedProposalTemplateModel>(
        sharedProposalTemplates.map((sharedProposalTemplate) =>
          mapSharedProposalTemplateToSharedProposalTemplateModel(
            sharedProposalTemplate,
          ),
        ),
      );
    }
  }

  public async migrateSubscription(): Promise<void> {
    for await (const subscriptions of this.migrateEntity<Subscription>(
      Subscription.name,
      this.subscriptionRepository,
    )) {
      await this.dynamodbService.batchPut<SubscriptionModel>(
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
      await PromisePool.withConcurrency(1)
        .for(tokenBalances)
        .process(async (tokenBalance) => {
          return this.tokenService.saveTokenBalanceToDao(tokenBalance);
        });
    }
  }

  public async migrateTokenPrices(): Promise<void> {
    for await (const tokens of this.migrateEntity<Token>(
      Token.name,
      this.tokenRepository,
    )) {
      await this.dynamodbService.batchPut<TokenPriceModel>(
        tokens.map((token) => mapTokenToTokenPriceModel(token)),
      );
    }
  }

  private async *migrateEntity<E>(
    entity: string,
    repo: Repository<E> | MongoRepository<E>,
    findParams?: FindManyOptions<E>,
    startFrom = 0,
  ): AsyncGenerator<E[]> {
    this.logger.log(`Migrating ${entity}...`);

    const totalCount = await repo.count();

    let count = startFrom;
    for await (const entities of this.getEntities(
      repo,
      findParams,
      startFrom,
    )) {
      count += entities.length;

      this.logger.log(`Migrating ${entity}: chunk ${count}/${totalCount}`);

      yield entities;
    }

    this.logger.log(`Migrated ${entity}: ${count}. Finished.`);
  }

  private async *getEntities<E>(
    repo: Repository<E> | MongoRepository<E>,
    findParams?: FindManyOptions<E>,
    startFrom = 0,
  ): AsyncGenerator<E[]> {
    const chunkSize = 20;
    const count = await repo.count();
    const chunkCount = getChunkCount(BigInt(count), chunkSize);

    for (let i = startFrom / chunkSize; i < chunkCount; i++) {
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
