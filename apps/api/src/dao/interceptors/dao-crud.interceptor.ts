import { Injectable } from '@nestjs/common';
import { CrudRequest, MergedCrudOptions } from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { BaseCrudRequestInterceptor } from '@sputnik-v2/common';
import { DaoStatus } from '@sputnik-v2/dao';

@Injectable()
export class DaoCrudRequestInterceptor extends BaseCrudRequestInterceptor {
  public static readonly defaultFields = [
    'id',
    'config',
    'totalDaoFunds',
    'numberOfMembers',
    'numberOfGroups',
    'activeProposalCount',
    'totalProposalCount',
    'accountIds',
    'transactionHash',
    'createdAt',
  ];

  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
  ): CrudRequest {
    const crudRequest = super.getCrudRequest(parser, crudOptions);

    if (!crudRequest.parsed.fields?.length) {
      crudRequest.parsed.fields = DaoCrudRequestInterceptor.defaultFields;
    }

    crudRequest.parsed.search['$and'].push({
      status: { $ne: DaoStatus.Disabled },
    });

    return crudRequest;
  }
}
