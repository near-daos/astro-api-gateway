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

    const { sort } = crudRequest?.parsed || {};
    if (!sort || !sort.length) {
      crudRequest.parsed.sort = [{ field: 'createdAt', order: 'DESC' }];
    }

    return crudRequest;
  }
}
