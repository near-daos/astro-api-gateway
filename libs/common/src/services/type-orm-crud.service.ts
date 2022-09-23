import { ObjectLiteral } from 'typeorm';

import { QueryFilter } from '@nestjsx/crud-request';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

export class BaseTypeOrmCrudService<T> extends TypeOrmCrudService<T> {
  protected mapOperatorsToQuery(
    cond: QueryFilter,
    param: any,
  ): { str: string; params: ObjectLiteral } {
    const mapped = super.mapOperatorsToQuery(cond, param);
    const field = this.getFieldWithAlias(cond.field);

    const { value, operator } = cond;

    if (value === 'now') {
      let operation = null;
      switch (operator as any) {
        case '$gt':
          operation = '>';

          break;
        case '$lt':
          operation = '<';

          break;
        case '$gte':
          operation = '>=';

          break;
        case '$lte':
          operation = '<=';

          break;
      }

      if (operation) {
        const nowNanos = `extract(epoch from now()) * ${Math.pow(10, 9)}`;

        mapped.str = `${field} ${operation} ${nowNanos}`;
      }
    }

    return mapped;
  }
}
