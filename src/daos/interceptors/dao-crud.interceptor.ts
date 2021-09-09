import { Injectable } from '@nestjs/common';
import { CrudRequest, MergedCrudOptions } from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { BaseCrudRequestInterceptor } from 'src/common/interceptors/crud.interceptor';

@Injectable()
export class DaoCrudRequestInterceptor extends BaseCrudRequestInterceptor {
  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
  ): CrudRequest {
    const crudRequest = super.getCrudRequest(parser, crudOptions);

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
