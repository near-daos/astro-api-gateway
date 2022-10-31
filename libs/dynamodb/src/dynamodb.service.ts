import * as AWS from 'aws-sdk';
import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { Dao } from '@sputnik-v2/dao/entities';
import { Proposal } from '@sputnik-v2/proposal/entities';
import { Bounty } from '@sputnik-v2/bounty/entities';
import { Account } from '@sputnik-v2/account/entities';
import {
  AccountNotification,
  AccountNotificationSettings,
} from '@sputnik-v2/notification';
import { Comment } from '@sputnik-v2/comment/entities';
import { DraftComment } from '@sputnik-v2/draft-comment/entities';
import { DaoStats } from '@sputnik-v2/stats/entities';
import {
  DraftProposal,
  DraftProposalHistory,
} from '@sputnik-v2/draft-proposal/entities';
import { NFTToken, TokenBalance } from '@sputnik-v2/token/entities';
import {
  ProposalTemplate,
  SharedProposalTemplate,
} from '@sputnik-v2/proposal-template/entities';
import { Subscription } from '@sputnik-v2/subscription/entities';

import {
  BaseModel,
  BountyModel,
  DaoModel,
  mapBountyToBountyModel,
  mapDaoToDaoModel,
  mapProposalToProposalModel,
  mapAccountToAccountModel,
  ProposalModel,
  AccountModel,
  AccountNotificationModel,
  mapAccountNotificationToAccountNotificationModel,
  AccountNotificationSettingsModel,
  mapAccountNotificationSettingsToAccountNotificationSettingsModel,
  CommentModel,
  mapCommentToCommentModel,
  mapDraftCommentToCommentModel,
  DaoStatsModel,
  mapDaoStatsToDaoStatsModel,
  DraftProposalModel,
  mapDraftProposalToDraftProposalModel,
  NftModel,
  mapNftTokenToNftModel,
  ProposalTemplateModel,
  mapProposalTemplateToProposalTemplateModel,
  mapSharedProposalTemplateToSharedProposalTemplateModel,
  SharedProposalTemplateModel,
  SubscriptionModel,
  mapSubscriptionToSubscriptionModel,
  TokenBalanceModel,
  mapTokenBalanceToTokenBalanceModel,
} from './models';
import { DynamoEntityType } from './types';

@Injectable()
export class DynamodbService {
  private client: AWS.DynamoDB.DocumentClient;

  private tableName: string;

  constructor(private readonly configService: ConfigService) {
    const { region, endpoint, tableName, accessKeyId, secretAccessKey } =
      configService.get('dynamodb');

    let options: DocumentClient.DocumentClientOptions &
      DynamoDB.Types.ClientConfiguration = {
      region,
    };

    if (accessKeyId && secretAccessKey) {
      console.log('accessKeyId:', accessKeyId);
      options = { ...options, credentials: { accessKeyId, secretAccessKey } };
    }

    if (endpoint) {
      options = { ...options, endpoint };
    }

    this.client = new AWS.DynamoDB.DocumentClient({ ...options });

    this.tableName = tableName;
  }

  public async saveAccount(account: Partial<Account>) {
    return this.saveItem<AccountModel>(mapAccountToAccountModel(account));
  }

  public async saveAccountNotification(
    accountNotification: Partial<AccountNotification>,
  ) {
    return this.saveItem<AccountNotificationModel>(
      mapAccountNotificationToAccountNotificationModel(accountNotification),
    );
  }

  public async saveAccountNotificationSettings(
    accountNotificationSettings: Partial<AccountNotificationSettings>,
  ) {
    return this.saveItem<AccountNotificationSettingsModel>(
      mapAccountNotificationSettingsToAccountNotificationSettingsModel(
        accountNotificationSettings,
      ),
    );
  }

  public async saveBounty(bounty: Partial<Bounty>, proposalId?: number) {
    return this.saveItem<BountyModel>(
      mapBountyToBountyModel(bounty, proposalId),
    );
  }

  public async saveComment(comment: Partial<Comment>) {
    return this.saveItem<CommentModel>(mapCommentToCommentModel(comment));
  }

  public async saveDraftComment(comment: Partial<DraftComment>) {
    return this.saveItem<CommentModel>(mapDraftCommentToCommentModel(comment));
  }

  public async saveDao(dao: Dao) {
    return this.saveItem<DaoModel>(mapDaoToDaoModel(dao));
  }

  public async saveDaoStats(daoStats: DaoStats) {
    return this.saveItem<DaoStatsModel>(mapDaoStatsToDaoStatsModel(daoStats));
  }

  public async saveDraftProposal(
    draftProposal: DraftProposal,
    history?: DraftProposalHistory[],
  ) {
    return this.saveItem<DraftProposalModel>(
      mapDraftProposalToDraftProposalModel(draftProposal, history),
    );
  }

  public async saveNft(nft: NFTToken) {
    return this.saveItem<NftModel>(mapNftTokenToNftModel(nft));
  }

  public async saveProposal(proposal: Proposal) {
    return this.saveItem<ProposalModel>(mapProposalToProposalModel(proposal));
  }

  public async saveProposalTemplate(proposalTemplate: ProposalTemplate) {
    return this.saveItem<ProposalTemplateModel>(
      mapProposalTemplateToProposalTemplateModel(proposalTemplate),
    );
  }

  public async saveSharedProposalTemplate(
    sharedProposalTemplate: SharedProposalTemplate,
    daoId: string,
  ) {
    return this.saveItem<SharedProposalTemplateModel>(
      mapSharedProposalTemplateToSharedProposalTemplateModel(
        sharedProposalTemplate,
        daoId,
      ),
    );
  }

  public async saveSubscription(subscription: Subscription) {
    return this.saveItem<SubscriptionModel>(
      mapSubscriptionToSubscriptionModel(subscription),
    );
  }

  public async saveTokenBalance(tokenBalance: TokenBalance) {
    return this.saveItem<TokenBalanceModel>(
      mapTokenBalanceToTokenBalanceModel(tokenBalance),
    );
  }

  public async batchPut<M extends BaseModel = BaseModel>(
    items: Partial<M>[],
    tableName = this.tableName,
  ) {
    return this.client
      .batchWrite({
        RequestItems: {
          [tableName]: items.map((Item) => ({
            PutRequest: { Item },
          })),
        },
      })
      .promise();
  }

  public async getItemByType<M extends BaseModel = BaseModel>(
    partitionId: string,
    entityType: DynamoEntityType,
    id: string,
  ): Promise<M | null> {
    return await this.getItemById(partitionId, `${entityType}:${id}`);
  }

  public async getItemById<M extends BaseModel = BaseModel>(
    partitionId: string,
    entityId: string,
    tableName = this.tableName,
  ): Promise<M | null> {
    return await this.client
      .get({
        TableName: tableName,
        Key: { partitionId, entityId },
      })
      .promise()
      .then(({ Item }) => Item as M)
      .catch(() => null);
  }

  public async saveItem<M extends BaseModel = BaseModel>(
    data: Partial<M>,
    tableName = this.tableName,
  ) {
    const processingTimeStamp = Date.now();
    const item = await this.getItemById(
      data.partitionId,
      data.entityId,
      tableName,
    );
    return this.client
      .put({
        TableName: tableName,
        Item: item
          ? { ...item, ...data, processingTimeStamp }
          : { ...data, processingTimeStamp },
      })
      .promise();
  }
}
