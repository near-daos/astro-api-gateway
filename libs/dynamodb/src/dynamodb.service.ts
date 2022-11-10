import * as AWS from 'aws-sdk';
import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { Dao } from '@sputnik-v2/dao/entities';
import { Proposal } from '@sputnik-v2/proposal/entities';
import { Account } from '@sputnik-v2/account/entities';
import {
  AccountNotification,
  AccountNotificationSettings,
} from '@sputnik-v2/notification';
import { Comment } from '@sputnik-v2/comment/entities';
import { DraftComment } from '@sputnik-v2/draft-comment/entities';
import {
  DraftProposal,
  DraftProposalHistory,
} from '@sputnik-v2/draft-proposal/entities';
import { Token, TokenBalance } from '@sputnik-v2/token/entities';
import {
  ProposalTemplate,
  SharedProposalTemplate,
} from '@sputnik-v2/proposal-template/entities';
import { Subscription } from '@sputnik-v2/subscription/entities';
import { buildEntityId } from '@sputnik-v2/utils';
import PromisePool from '@supercharge/promise-pool';

import {
  AccountModel,
  AccountNotificationModel,
  AccountNotificationSettingsModel,
  BaseModel,
  CommentModel,
  DaoModel,
  DraftProposalModel,
  mapAccountNotificationSettingsToAccountNotificationSettingsModel,
  mapAccountNotificationToAccountNotificationModel,
  mapAccountToAccountModel,
  mapCommentToCommentModel,
  mapDaoToDaoModel,
  mapDraftCommentToCommentModel,
  mapDraftProposalToDraftProposalModel,
  mapProposalTemplateToProposalTemplateModel,
  mapProposalToProposalModel,
  mapSharedProposalTemplateToSharedProposalTemplateModel,
  mapSubscriptionToSubscriptionModel,
  mapTokenBalanceToTokenBalanceModel,
  mapTokenToTokenPriceModel,
  ProposalModel,
  ProposalTemplateModel,
  SharedProposalTemplateModel,
  SubscriptionModel,
  TokenBalanceModel,
  TokenPriceModel,
} from './models';
import {
  CountItemsQuery,
  DynamoEntityType,
  EntityId,
  QueryItemsQuery,
} from './types';
import { ScheduledProposalExpirationEvent } from '@sputnik-v2/dynamodb/models/scheduled-proposal-expiration.model';

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
      options = { ...options, credentials: { accessKeyId, secretAccessKey } };
    }

    if (endpoint) {
      options = { ...options, endpoint };
    }

    this.client = new AWS.DynamoDB.DocumentClient({ ...options });

    this.tableName = tableName;
  }

  async saveAccount(account: Partial<Account>) {
    return this.saveItem<AccountModel>(mapAccountToAccountModel(account));
  }

  async updateDraftProposalReplies(
    daoId: string,
    draftId: string,
    replies: number,
  ) {
    const draft = await this.getItemByType<DraftProposalModel>(
      daoId,
      DynamoEntityType.DraftProposal,
      draftId,
    );

    const currentReplies = draft.replies;

    await this.saveItem<DraftProposalModel>({
      partitionId: daoId,
      entityId: buildEntityId(DynamoEntityType.DraftProposal, draftId),
      entityType: DynamoEntityType.DraftProposal,
      replies: currentReplies ?? 0 + replies,
    });
  }

  async saveAccountNotification(
    accountNotification: Partial<AccountNotification>,
  ) {
    return this.saveItem<AccountNotificationModel>(
      mapAccountNotificationToAccountNotificationModel(accountNotification),
    );
  }

  async saveAccountNotificationSettings(
    accountNotificationSettings: Partial<AccountNotificationSettings>,
  ) {
    return this.saveItem<AccountNotificationSettingsModel>(
      mapAccountNotificationSettingsToAccountNotificationSettingsModel(
        accountNotificationSettings,
      ),
    );
  }

  async saveComment(comment: Partial<Comment>) {
    return this.saveItem<CommentModel>(mapCommentToCommentModel(comment));
  }

  async saveDraftComment(comment: Partial<DraftComment>) {
    return this.saveItem<CommentModel>(mapDraftCommentToCommentModel(comment));
  }

  async saveDao(dao: Dao) {
    return this.saveItem<DaoModel>(mapDaoToDaoModel(dao));
  }

  async saveDraftProposal(
    draftProposal: DraftProposal,
    history?: DraftProposalHistory[],
  ) {
    return this.saveItem<DraftProposalModel>(
      mapDraftProposalToDraftProposalModel(draftProposal, history),
    );
  }

  async saveProposal(proposal: Proposal) {
    return this.saveItem<ProposalModel>(mapProposalToProposalModel(proposal));
  }

  async saveProposalTemplate(proposalTemplate: ProposalTemplate) {
    return this.saveItem<ProposalTemplateModel>(
      mapProposalTemplateToProposalTemplateModel(proposalTemplate),
    );
  }

  async saveSharedProposalTemplate(
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

  async saveSubscription(subscription: Subscription) {
    return this.saveItem<SubscriptionModel>(
      mapSubscriptionToSubscriptionModel(subscription),
    );
  }

  async saveTokenBalance(tokenBalance: TokenBalance) {
    return this.saveItem<TokenBalanceModel>(
      mapTokenBalanceToTokenBalanceModel(tokenBalance),
    );
  }

  async saveTokenPrice(token: Partial<Token>) {
    return this.saveItem<TokenPriceModel>(mapTokenToTokenPriceModel(token));
  }

  async batchDelete<M extends BaseModel>(
    items: Partial<M>[],
    tableName = this.tableName,
  ) {
    return PromisePool.withConcurrency(10)
      .for(items)
      .process((item) => {
        return this.deleteItem(item, tableName);
      });
  }

  async batchPut<M extends BaseModel>(
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

  async getItemByType<M extends BaseModel>(
    partitionId: string,
    entityType: DynamoEntityType,
    id: string,
  ): Promise<M | null> {
    return await this.getItemById(partitionId, buildEntityId(entityType, id));
  }

  async getItemById<M extends BaseModel>(
    partitionId: string,
    entityId: EntityId,
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

  async queryItems<M extends BaseModel>(
    query: QueryItemsQuery,
    tableName = this.tableName,
  ): Promise<M[]> {
    return await this.client
      .query({
        TableName: tableName,
        ...query,
      })
      .promise()
      .then(({ Items }) => Items as M[])
      .catch(() => null);
  }

  async countItems(
    query: CountItemsQuery,
    tableName = this.tableName,
  ): Promise<number> {
    return await this.client
      .query({
        TableName: tableName,
        Select: 'COUNT',
        ...query,
      })
      .promise()
      .then(({ Count }) => Count)
      .catch(() => 0);
  }

  async queryItemsByType<M extends BaseModel>(
    partitionId: string,
    entityType: DynamoEntityType,
    query: CountItemsQuery = {},
    tableName = this.tableName,
  ): Promise<M[]> {
    return await this.queryItems<M>(
      {
        KeyConditionExpression:
          'partitionId = :partitionId and begins_with(entityId, :entityType)',
        ...query,
        ExpressionAttributeValues: {
          ':partitionId': partitionId,
          ':entityType': buildEntityId(entityType, ''),
          ...query.ExpressionAttributeValues,
        },
      },
      tableName,
    );
  }

  async countItemsByType(
    partitionId: string,
    entityType: DynamoEntityType,
    query: CountItemsQuery = {},
    tableName = this.tableName,
  ): Promise<number> {
    return this.countItems(
      {
        KeyConditionExpression:
          'partitionId = :partitionId and begins_with(entityId, :entityType)',
        ...query,
        ExpressionAttributeValues: {
          ':partitionId': partitionId,
          ':entityType': buildEntityId(entityType, ''),
          ...query.ExpressionAttributeValues,
        },
      },
      tableName,
    );
  }

  async saveItem<M extends BaseModel>(
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

  async archiveItemByType(
    partitionId: string,
    entityType: DynamoEntityType,
    id: string,
    isArchived = true,
  ) {
    return this.saveItem({
      partitionId,
      entityId: buildEntityId(entityType, id),
      isArchived,
    });
  }

  async deleteItem<M extends BaseModel>(
    data: Partial<M>,
    tableName = this.tableName,
  ) {
    return this.client
      .delete({
        TableName: tableName,
        Key: { partitionId: data.partitionId, entityId: data.entityId },
      })
      .promise();
  }

  async saveScheduleProposalExpireEvent(
    daoId: string,
    proposalId: number,
    proposalExpiration: number,
  ) {
    const secondsSinceEpoch = Math.round(Date.now() / 1000);
    const proposalExpirationPeriod = proposalExpiration / 1000000000;
    const ttl = secondsSinceEpoch + proposalExpirationPeriod;

    const item: ScheduledProposalExpirationEvent = {
      createTimestamp: new Date().getTime(),
      entityId: `${DynamoEntityType.ScheduledProposalExpirationEvent}:${proposalId}`,
      entityType: DynamoEntityType.ScheduledProposalExpirationEvent,
      isArchived: false,
      partitionId: daoId,
      processingTimeStamp: new Date().getTime(),
      proposalId: proposalId,
      ttl,
    };

    return this.saveItem<ScheduledProposalExpirationEvent>(item);
  }
}
