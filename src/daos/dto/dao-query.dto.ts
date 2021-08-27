import { PagingQuery } from 'src/common';
import { DaoSortParam } from './dao-sort.dto';

export class DaoQuery extends PagingQuery {
  order: DaoSortParam;
}
