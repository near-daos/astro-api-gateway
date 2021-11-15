import { Injectable } from '@nestjs/common';
import { CrudRequest, MergedCrudOptions } from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { BaseCrudRequestInterceptor } from '@sputnik-v2/common';

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
      receipts: {
        eager: true,
      },
      'receipts.receiptActions': {
        eager: true,
      },
    };

    return crudRequest;
  }
}
