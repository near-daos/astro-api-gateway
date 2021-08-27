import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { SortDirection, SortParam } from '../dto/SortParam';

@Injectable()
export class SortPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { type } = metadata;
    if (type === 'query') {
      return this.transformQuery(value);
    }

    return value;
  }

  transformQuery(query: any) {
    if (typeof query !== 'object') {
      return query;
    }

    const { sort } = query;
    if (sort) {
      query.order = this.convertToOrder(sort);
    }

    return query;
  }

  private convertToOrder(sort: string): SortParam {
    const order = sort.split(',').reduce((obj, item) => {
      const isDesc = item.startsWith('-');

      return {
        ...obj,
        [isDesc ? item.substring(1) : item]: isDesc
          ? SortDirection.DESC
          : SortDirection.ASC,
      };
    }, {});

    return order;
  }
}
