import { Injectable } from '@nestjs/common';
import {
  CrudRequest,
  CrudRequestInterceptor,
  MergedCrudOptions,
} from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';

@Injectable()
export class BaseCrudRequestInterceptor extends CrudRequestInterceptor {
  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
  ): CrudRequest {
    const crudRequest = super.getCrudRequest(parser, crudOptions);

    const { sort, offset, limit } = crudRequest?.parsed || {};
    if (!sort || !sort.length) {
      crudRequest.parsed.sort = [{ field: 'createdAt', order: 'DESC' }];
    }

    crudRequest.parsed.offset = offset || 0;
    crudRequest.parsed.limit = limit || 50;

    return crudRequest;
  }
}
