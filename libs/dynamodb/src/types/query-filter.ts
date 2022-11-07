export interface DynamoQueryFilter {
  expression: string;
  variables: Record<string, any>;
}
