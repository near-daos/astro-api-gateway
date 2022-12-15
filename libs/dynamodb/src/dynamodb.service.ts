import * as AWS from 'aws-sdk';
import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { buildEntityId, deepFilter, getChunks } from '@sputnik-v2/utils';
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
  private readonly logger = new Logger(DynamodbService.name);

  private client: AWS.DynamoDB.DocumentClient;
  private tableName: string;
  private logging = false;

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

    const logger = this.logging
      ? { log: this.logger.verbose.bind(this.logger) }
      : undefined;

    this.client = new AWS.DynamoDB.DocumentClient({
      ...options,
      logger,
    });
    this.tableName = tableName;
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

  async batchPut<M>(
    items: PartialEntity<M>[],
    tableName = this.tableName,
  ): Promise<DocumentClient.BatchWriteItemOutput[]> {
    if (!items.length) {
      return;
    }
    const chunks = getChunks(items, 25);
    return Promise.all(
      chunks.map((chunk) => this._batchPut<M>(chunk, tableName)),
    );
  }

  private async _batchPut<M>(
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
                createdAt: timestamp,
                updatedAt: timestamp,
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
    const dataToUpdate = deepFilter(
      {
        updatedAt: Date.now(),
        ...rest,
      },
      ([, value]) => value !== undefined,
    );
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
    checkIfExists = false,
    tableName = this.tableName,
  ): Promise<PartialEntity<M> | undefined> {
    return this.getItemById(
      partitionId,
      buildEntityId(entityType, id),
      checkIfExists,
      tableName,
    );
  }

  async getItemById<M>(
    partitionId: string,
    entityId: EntityId,
    checkIfExists = false,
    tableName = this.tableName,
  ): Promise<PartialEntity<M> | undefined> {
    return this.client
      .get({
        TableName: tableName,
        Key: { partitionId, entityId },
      })
      .promise()
      .then(({ Item }) => Item as PartialEntity<M>)
      .catch((err) => (checkIfExists ? Promise.reject(err) : undefined));
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
    const dataToPut = deepFilter(
      {
        createdAt: timestamp,
        updatedAt: timestamp,
        ...data,
      },
      ([, value]) => value !== undefined,
    );
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

  async increment<M>(
    data: PartialEntity<M>,
    field: keyof M,
    value = 1,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>> {
    const item = await this.getItemById<M>(
      data.partitionId,
      data.entityId,
      true,
      tableName,
    );
    return this.saveItem<M>({
      ...item,
      [field]: Number(item[field] || 0) + value,
    });
  }

  async decrement<M>(
    data: PartialEntity<M>,
    field: keyof M,
    value = -1,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>> {
    return this.increment<M>(data, field, value, tableName);
  }

  async incrementByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    id: string,
    field: keyof M,
    value = 1,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>> {
    return this.increment<M>(
      {
        partitionId,
        entityId: buildEntityId(entityType, id),
        entityType,
      } as PartialEntity<M>,
      field,
      value,
      tableName,
    );
  }

  async decrementByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    id: string,
    field: keyof M,
    value = -1,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>> {
    return this.incrementByType<M>(
      partitionId,
      entityType,
      id,
      field,
      value,
      tableName,
    );
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
