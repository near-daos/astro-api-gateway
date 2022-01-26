import { Injectable } from '@nestjs/common';
import { CrudRequest, MergedCrudOptions } from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { BaseCrudRequestInterceptor } from '@sputnik-v2/common';

@Injectable()
export class ProposalCrudRequestInterceptor extends BaseCrudRequestInterceptor {
  public static readonly defaultFields = [
    'id',
    'daoId',
    'type',
    'kind',
    'description',
    'votes',
    'status',
    'voteStatus',
    'proposer',
    'votePeriodEnd',
    'createdAt',
  ];

  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
  ): CrudRequest {
    const crudRequest = super.getCrudRequest(parser, crudOptions);

    if (!crudRequest.parsed.fields?.length) {
      crudRequest.parsed.fields = ProposalCrudRequestInterceptor.defaultFields;
    }

    crudRequest.options.query.join = {
      dao: {
        eager: true,
        alias: 'dao',
        allow: ['id', 'config'],
      },
      actions: {
        eager: true,
      },
    };

    return crudRequest;
  }
}
