import { IsNotEmpty } from 'class-validator';
import { PagingQuery } from './PagingQuery';

export class SearchQuery extends PagingQuery {
  @IsNotEmpty()
  query: string;
}
