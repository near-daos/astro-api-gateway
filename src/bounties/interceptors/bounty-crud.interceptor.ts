import { Injectable } from '@nestjs/common';
import { CrudRequest, MergedCrudOptions } from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { BaseCrudRequestInterceptor } from 'src/common/interceptors/crud.interceptor';

@Injectable()
export class BountyCrudRequestInterceptor extends BaseCrudRequestInterceptor {
  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
  ): CrudRequest {
    const crudRequest = super.getCrudRequest(parser, crudOptions);

    crudRequest.options.query.join = {
      dao: {
        eager: true,
      },
      'dao.policy': {
        eager: true,
      },
      bountyClaims: {
        eager: true
      }
    };

    return crudRequest;
  }
}
