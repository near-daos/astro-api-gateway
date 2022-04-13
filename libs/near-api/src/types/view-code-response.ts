import { QueryResponseKind } from 'near-api-js/lib/providers/provider';

export interface ViewCodeResponse extends QueryResponseKind {
  hash: string;
}
