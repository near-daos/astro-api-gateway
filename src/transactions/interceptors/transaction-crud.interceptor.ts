import { Injectable } from '@nestjs/common';
import { CrudRequest, MergedCrudOptions } from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { BaseCrudRequestInterceptor } from 'src/common/interceptors/crud.interceptor';

@Injectable()
export class TransactionCrudRequestInterceptor extends BaseCrudRequestInterceptor {
  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
  ): CrudRequest {
    const crudRequest = super.getCrudRequest(parser, crudOptions);

    const { sort } = crudRequest?.parsed || {};
    if (!sort || !sort.length) {
      crudRequest.parsed.sort = [{ field: 'blockTimestamp', order: 'DESC' }];
    }

    crudRequest.options.query.join = {
      transactionAction: {
        eager: true,
      },
    };

    return crudRequest;
  }
}
