import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export type QueryItemsQuery = Omit<DocumentClient.QueryInput, 'TableName'>;

export type CountItemsQuery = Omit<
  DocumentClient.QueryInput,
  'TableName' | 'Select'
>;
