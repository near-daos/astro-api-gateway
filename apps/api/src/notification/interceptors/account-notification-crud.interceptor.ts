import { Injectable } from '@nestjs/common';
import { CrudRequest, MergedCrudOptions } from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { BaseCrudRequestInterceptor } from '@sputnik-v2/common';

@Injectable()
export class AccountNotificationCrudRequestInterceptor extends BaseCrudRequestInterceptor {
  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
  ): CrudRequest {
    const crudRequest = super.getCrudRequest(parser, crudOptions);

    crudRequest.options.query.join = {
      notification: {
        eager: true,
      },
      'notification.dao': {
        eager: true,
      },
    };

    return crudRequest;
  }
}
