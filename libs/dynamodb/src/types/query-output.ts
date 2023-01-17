import { PartialEntity } from '@sputnik-v2/dynamodb';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export interface QueryOutput<M> extends DocumentClient.QueryOutput {
  Items: PartialEntity<M>[];
}
