export interface DynamoPaginatedResponse<T> {
  data: T[];
  meta: {
    nextToken: string | null;
  };
}
