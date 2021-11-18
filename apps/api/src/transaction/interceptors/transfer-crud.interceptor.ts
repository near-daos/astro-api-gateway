import { Injectable } from '@nestjs/common';
import { CrudRequest, MergedCrudOptions } from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { ActionKind } from '@sputnik-v2/near-indexer';

import { TransactionCrudRequestInterceptor } from './transaction-crud.interceptor';

@Injectable()
export class TransferCrudRequestInterceptor extends TransactionCrudRequestInterceptor {
  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
  ): CrudRequest {
    const crudRequest = super.getCrudRequest(parser, crudOptions);

    crudRequest.parsed.search = {
      $and: [
        ...crudRequest?.parsed?.search?.$and,
        {
          'transactionAction.actionKind': { $eq: ActionKind.Transfer },
        },
      ],
    };

    return crudRequest;
  }
}
