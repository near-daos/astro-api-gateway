import { Injectable } from '@nestjs/common';
import { CrudRequest, MergedCrudOptions } from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { BaseCrudRequestInterceptor } from 'src/common/interceptors/crud.interceptor';
import { DaoStatus } from '../types/dao-status';

@Injectable()
export class DaoCrudRequestInterceptor extends BaseCrudRequestInterceptor {
  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
  ): CrudRequest {
    const crudRequest = super.getCrudRequest(parser, crudOptions);

    crudRequest.parsed.search = {
      $and: [
        ...crudRequest?.parsed?.search?.$and,
        {
          status: { $eq: DaoStatus.Success },
        },
      ],
    };

    crudRequest.options.query.join = {
      policy: {
        eager: true,
      },
      'policy.roles': {
        eager: true,
      },
    };

    return crudRequest;
  }
}
