import * as AWS from 'aws-sdk';
import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

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
import { buildEntityId, getChunks } from '@sputnik-v2/utils';

import {
  AccountModel,
  AccountNotificationModel,
  AccountNotificationSettingsModel,
  CommentModel,
  DaoModel,
  DraftProposalModel,
  mapAccountNotificationSettingsModel,
  mapAccountNotificationSettingsToAccountNotificationSettingsItemModel,
  mapAccountNotificationToAccountNotificationModel,
  mapAccountToAccountModel,
  mapCommentToCommentModel,
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
  TokenPriceModel,
} from './models';
import {
  CountItemsQuery,
  DynamoEntityType,
  EntityId,
  EntityKey,
  PartialEntity,
  QueryItemsQuery,
} from './types';

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
    await this.saveItem<DraftProposalModel>({
      partitionId: daoId,
      entityId: buildEntityId(DynamoEntityType.DraftProposal, draftId),
      entityType: DynamoEntityType.DraftProposal,
      replies: replies,
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
    const item = await this.getItemByType<AccountNotificationSettingsModel>(
      accountNotificationSettings.accountId,
      DynamoEntityType.AccountNotificationSettings,
      accountNotificationSettings.accountId,
    );
    const model =
      item ||
      mapAccountNotificationSettingsModel(
        accountNotificationSettings.accountId,
        [],
      );
    const updatedSettings =
      mapAccountNotificationSettingsToAccountNotificationSettingsItemModel(
        accountNotificationSettings,
      );

    const settingsIndex = model.settings.findIndex(
      ({ daoId }) => daoId === accountNotificationSettings.daoId,
    );

    if (settingsIndex >= 0) {
      model.settings[settingsIndex] = updatedSettings;
    } else {
      model.settings.push(updatedSettings);
    }

    return item
      ? await this.updateItem(
          accountNotificationSettings.accountId,
          buildEntityId(
            DynamoEntityType.AccountNotificationSettings,
            accountNotificationSettings.accountId,
          ),
          { settings: model.settings, processingTimeStamp: Date.now() },
        )
      : await this.saveItem(model, false);
  }

  async saveComment(comment: Partial<Comment>) {
    return this.saveItem<CommentModel>(mapCommentToCommentModel(comment));
  }

  async saveDraftComment(comment: Partial<DraftComment>) {
    return this.saveItem<CommentModel>(mapDraftCommentToCommentModel(comment));
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
  ) {
    return this.saveItem<SharedProposalTemplateModel>(
      mapSharedProposalTemplateToSharedProposalTemplateModel(
        sharedProposalTemplate,
      ),
    );
  }

  async saveSubscription(subscription: Subscription) {
    return this.saveItem<SubscriptionModel>(
      mapSubscriptionToSubscriptionModel(subscription),
    );
  }

  async saveTokenBalanceToDao(tokenBalance: TokenBalance) {
    const { accountId: daoId } = tokenBalance;
    const updatedToken = mapTokenBalanceToTokenBalanceModel(tokenBalance);

    const dao = await this.getItemByType<DaoModel>(
      daoId,
      DynamoEntityType.Dao,
      daoId,
    );
    const tokenIndex = dao.tokens.findIndex(
      (token) => token.tokenId === updatedToken.tokenId,
    );

    if (tokenIndex >= 0) {
      dao.tokens[tokenIndex] = updatedToken;
    } else {
      dao.tokens.push(updatedToken);
    }

    return this.updateItemByType(daoId, DynamoEntityType.Dao, daoId, {
      tokens: dao.tokens,
    });
  }

  async saveTokenPrice(token: Partial<Token>) {
    return this.saveItem<TokenPriceModel>(mapTokenToTokenPriceModel(token));
  }

  async batchDelete<M>(
    items: PartialEntity<M>[],
    tableName = this.tableName,
  ): Promise<DocumentClient.BatchWriteItemOutput> {
    if (!items.length) {
      return;
    }

    return this.client
      .batchWrite({
        RequestItems: {
          [tableName]: items.map(({ partitionId, entityId }) => ({
            DeleteRequest: {
              Key: { partitionId, entityId },
            },
          })),
        },
      })
      .promise();
  }

  async batchPutChunked<M>(
      items: PartialEntity<M>[],
      tableName = this.tableName,
  ): Promise<DocumentClient.BatchWriteItemOutput[]> {
    if (!items.length) {
      return;
    }
    const chunks = getChunks(items, 24);
    return await Promise.all(chunks.map(chunk => this.batchPut<M>(chunk, tableName));
  }

  async batchPut<M>(
      items: PartialEntity<M>[],
      tableName = this.tableName,
  ): Promise<DocumentClient.BatchWriteItemOutput> {
    if (!items.length) {
      return;
    }
    const timestamp = Date.now();
    return this.client
        .batchWrite({
          RequestItems: {
            [tableName]: items.map((item) => ({
              PutRequest: {
                Item: {
                  createTimestamp: timestamp,
                  processingTimeStamp: timestamp,
                  ...item,
                },
              },
            })),
          },
        })
        .promise();
  }

  async batchGet<M>(
    keys: EntityKey[],
    tableName = this.tableName,
  ): Promise<PartialEntity<M>[]> {
    if (!keys.length) {
      return [];
    }
    return this.client
      .batchGet({
        RequestItems: {
          [tableName]: {
            Keys: keys.map(({ partitionId, entityId }) => ({
              partitionId,
              entityId,
            })),
          },
        },
      })
      .promise()
      .then(({ Responses }) => Responses[tableName] as PartialEntity<M>[]);
  }

  async updateItem<M>(
    data: PartialEntity<M>,
    checkIfExists = true,
    tableName = this.tableName,
  ): Promise<PartialEntity<M> | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { partitionId, entityId, entityType, ...rest } = data;
    const dataToUpdate = { processingTimeStamp: Date.now(), ...rest };
    const keys = Object.keys(dataToUpdate);

    return this.client
      .update({
        Key: {
          partitionId,
          entityId,
        },
        UpdateExpression: `SET ${keys
          .map((k, index) => `#field${index} = :value${index}`)
          .join(', ')}`,
        ExpressionAttributeNames: keys.reduce(
          (accumulator, k, index) => ({
            ...accumulator,
            [`#field${index}`]: k,
          }),
          {},
        ),
        ExpressionAttributeValues: keys.reduce(
          (accumulator, k, index) => ({
            ...accumulator,
            [`:value${index}`]: dataToUpdate[k],
          }),
          {},
        ),
        ...(checkIfExists
          ? {
              ConditionExpression:
                'attribute_exists(partitionId) AND attribute_exists(entityId)',
            }
          : {}),
        TableName: tableName,
        ReturnValues: 'ALL_NEW',
      })
      .promise()
      .then(({ Attributes }) => Attributes as PartialEntity<M>);
  }

  async updateItemByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    id: string,
    data: Partial<M>,
    checkIfExists = true,
    tableName = this.tableName,
  ): Promise<PartialEntity<M> | undefined> {
    return this.updateItem<M>(
      {
        ...data,
        partitionId,
        entityType,
        entityId: buildEntityId(entityType, id),
      },
      checkIfExists,
      tableName,
    );
  }

  async getItemByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    id: string,
    tableName = this.tableName,
  ): Promise<PartialEntity<M> | null> {
    return this.getItemById(
      partitionId,
      buildEntityId(entityType, id),
      tableName,
    );
  }

  async getItemById<M>(
    partitionId: string,
    entityId: EntityId,
    tableName = this.tableName,
  ): Promise<PartialEntity<M> | undefined> {
    return this.client
      .get({
        TableName: tableName,
        Key: { partitionId, entityId },
      })
      .promise()
      .then(({ Item }) => Item as PartialEntity<M>)
      .catch(() => undefined);
  }

  async queryItems<M>(
    query: QueryItemsQuery,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>[]> {
    return this.client
      .query({
        TableName: tableName,
        ...query,
      })
      .promise()
      .then(({ Items }) => Items as PartialEntity<M>[]);
  }

  async countItems(
    query: CountItemsQuery,
    tableName = this.tableName,
  ): Promise<number> {
    return this.client
      .query({
        TableName: tableName,
        Select: 'COUNT',
        ...query,
      })
      .promise()
      .then(({ Count }) => Count);
  }

  async queryItemsByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    query: CountItemsQuery = {},
    tableName = this.tableName,
  ): Promise<PartialEntity<M>[]> {
    return this.queryItems<M>(
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

  async putItem<M>(
    data: PartialEntity<M>,
    checkIfExists = true,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>> {
    const timestamp = Date.now();
    const dataToPut: PartialEntity<M> = {
      createTimestamp: timestamp,
      processingTimeStamp: timestamp,
      ...data,
    };
    return this.client
      .put({
        TableName: tableName,
        Item: dataToPut,
        ...(checkIfExists
          ? {
              ConditionExpression:
                'attribute_not_exists(partitionId) AND attribute_not_exists(entityId)',
            }
          : {}),
      })
      .promise()
      .then(() => dataToPut);
  }

  async putItemByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    id: string,
    data: Partial<M>,
    checkIfExists = true,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>> {
    return this.putItem<M>(
      {
        ...data,
        partitionId,
        entityId: buildEntityId(entityType, id),
        entityType,
      },
      checkIfExists,
      tableName,
    );
  }

  async saveItem<M>(
    data: PartialEntity<M>,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>> {
    try {
      return await this.putItem(data, true, tableName);
    } catch (err) {
      if (err.code === 'ConditionalCheckFailedException') {
        return this.updateItem(data, true, tableName);
      }
      throw err;
    }
  }

  async saveItemByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    id: string,
    data: Partial<M>,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>> {
    return this.saveItem<M>(
      {
        ...data,
        partitionId,
        entityId: buildEntityId(entityType, id),
        entityType,
      },
      tableName,
    );
  }

  async archiveItem<M>(
    data: PartialEntity<M>,
    isArchived = true,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>> {
    return this.saveItem<M>({ ...data, isArchived }, tableName);
  }

  async archiveItemByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    id: string,
    isArchived = true,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>> {
    return this.archiveItem<M>(
      {
        partitionId,
        entityId: buildEntityId(entityType, id),
        entityType,
      } as PartialEntity<M>,
      isArchived,
      tableName,
    );
  }

  async deleteItem<M>(
    data: PartialEntity<M>,
    checkIfExists = true,
    tableName = this.tableName,
  ): Promise<PartialEntity<M> | undefined> {
    return this.client
      .delete({
        TableName: tableName,
        Key: { partitionId: data.partitionId, entityId: data.entityId },
        ...(checkIfExists
          ? {
              ConditionExpression:
                'attribute_exists(partitionId) AND attribute_exists(entityId)',
            }
          : {}),
        ReturnValues: 'ALL_OLD',
      })
      .promise()
      .then(({ Attributes }) => Attributes as PartialEntity<M>);
  }

  async deleteItemByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    id: string,
    checkIfExists = true,
    tableName = this.tableName,
  ): Promise<PartialEntity<M> | undefined> {
    return this.deleteItem<M>(
      {
        partitionId,
        entityId: buildEntityId(entityType, id),
        entityType,
      } as PartialEntity<M>,
      checkIfExists,
      tableName,
    );
  }
}
