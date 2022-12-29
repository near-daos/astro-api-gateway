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
  QueryOutput,
} from './types';

@Injectable()
export class DynamodbService {
  private readonly BATCH_GET_LIMIT = 100;
  private readonly BATCH_WRITE_LIMIT = 25;

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
  ): Promise<number> {
    if (!items.length) {
      return 0;
    }
    const chunks = getChunks(items, this.BATCH_WRITE_LIMIT);
    const results = await Promise.all(
      chunks.map((chunk) => this._batchDelete<M>(chunk, tableName)),
    );
    return results.reduce((total, count) => total + count, 0);
  }

  private async _batchDelete<M>(
    items: PartialEntity<M>[],
    tableName = this.tableName,
  ): Promise<number> {
    if (!items.length) {
      return 0;
    }
    const { UnprocessedItems } = await this.client
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

    // handle unprocessed
    if (UnprocessedItems?.[tableName]?.length) {
      const unprocessedKeys = UnprocessedItems[tableName].map(
        ({ DeleteRequest }) => DeleteRequest.Key as PartialEntity<M>,
      );
      const deleted = items.length - unprocessedKeys.length;
      return deleted + (await this._batchDelete(unprocessedKeys, tableName));
    }

    return items.length;
  }

  async batchPut<M>(
    items: PartialEntity<M>[],
    tableName = this.tableName,
  ): Promise<number> {
    if (!items.length) {
      return 0;
    }
    const chunks = getChunks(items, this.BATCH_WRITE_LIMIT);
    const results = await Promise.all(
      chunks.map((chunk) => this._batchPut<M>(chunk, tableName)),
    );
    return results.reduce((total, count) => total + count, 0);
  }

  private async _batchPut<M>(
    items: PartialEntity<M>[],
    tableName = this.tableName,
  ): Promise<number> {
    if (!items.length) {
      return 0;
    }
    const timestamp = Date.now();
    const { UnprocessedItems } = await this.client
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

    // handle unprocessed
    if (UnprocessedItems?.[tableName]?.length) {
      const unprocessedItems = UnprocessedItems[tableName].map(
        ({ PutRequest }) => PutRequest.Item as PartialEntity<M>,
      );
      const put = items.length - unprocessedItems.length;
      return put + (await this._batchPut(unprocessedItems, tableName));
    }

    return items.length;
  }

  async batchGet<M>(
    keys: EntityKey[],
    tableName = this.tableName,
  ): Promise<PartialEntity<M>[]> {
    if (!keys.length) {
      return [];
    }
    const chunks = getChunks(keys, this.BATCH_GET_LIMIT);
    const results = await Promise.all(
      chunks.map((chunk) => this._batchGet<M>(chunk, tableName)),
    );
    return results.flat();
  }

  private async _batchGet<M>(
    keys: EntityKey[],
    tableName = this.tableName,
  ): Promise<PartialEntity<M>[]> {
    if (!keys.length) {
      return [];
    }

    const { Responses, UnprocessedKeys } = await this.client
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
      .promise();

    const results = (Responses?.[tableName] || []) as PartialEntity<M>[];

    // handle 16MB limit
    if (UnprocessedKeys?.[tableName]?.Keys?.length) {
      results.concat(
        await this._batchGet(
          UnprocessedKeys[tableName].Keys as EntityKey[],
          tableName,
        ),
      );
    }

    return results;
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

  private async getQueryItems<M>(
    query: QueryItemsQuery,
    tableName = this.tableName,
  ): Promise<QueryOutput<M>> {
    return this.client
      .query({
        TableName: tableName,
        ...query,
      })
      .promise()
      .then(({ Items, ...rest }) => ({
        Items: Items as PartialEntity<M>[],
        ...rest,
      }));
  }

  private async getQueryItemsByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    query: QueryItemsQuery = {},
    tableName = this.tableName,
  ): Promise<QueryOutput<M>> {
    return this.getQueryItems<M>(
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

  async queryItems<M>(
    query: QueryItemsQuery,
    tableName = this.tableName,
  ): Promise<PartialEntity<M>[]> {
    return (await this.getQueryItems<M>(query, tableName)).Items;
  }

  async queryItemsByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    query: QueryItemsQuery = {},
    tableName = this.tableName,
  ): Promise<PartialEntity<M>[]> {
    return (
      await this.getQueryItemsByType<M>(
        partitionId,
        entityType,
        query,
        tableName,
      )
    ).Items;
  }

  async *paginateItems<M>(
    query: QueryItemsQuery,
    tableName = this.tableName,
  ): AsyncGenerator<PartialEntity<M>[]> {
    const { Items, LastEvaluatedKey } = await this.getQueryItems<M>(
      query,
      tableName,
    );

    yield Items;

    if (LastEvaluatedKey) {
      yield* this.paginateItems<M>(
        {
          ...query,
          ExclusiveStartKey: LastEvaluatedKey,
        },
        tableName,
      );
    }
  }

  async *paginateItemsByType<M>(
    partitionId: string,
    entityType: DynamoEntityType,
    query: QueryItemsQuery = {},
    tableName = this.tableName,
  ): AsyncGenerator<PartialEntity<M>[]> {
    const { Items, LastEvaluatedKey } = await this.getQueryItemsByType<M>(
      partitionId,
      entityType,
      query,
      tableName,
    );

    yield Items;

    if (LastEvaluatedKey) {
      yield* this.paginateItemsByType<M>(
        partitionId,
        entityType,
        {
          ...query,
          ExclusiveStartKey: LastEvaluatedKey,
        },
        tableName,
      );
    }
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
