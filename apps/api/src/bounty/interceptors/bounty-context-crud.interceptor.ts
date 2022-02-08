import { Injectable } from '@nestjs/common';
import { CrudRequest, MergedCrudOptions } from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { BaseCrudRequestInterceptor } from '@sputnik-v2/common';

@Injectable()
export class BountyContextCrudRequestInterceptor extends BaseCrudRequestInterceptor {
  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
  ): CrudRequest {
    const crudRequest = super.getCrudRequest(parser, crudOptions);

    crudRequest.options.query.join = {
      proposal: {
        eager: true,
      },
      'proposal.dao': {
        eager: true,
        alias: 'dao',
        allow: ['id'],
      },
      'proposal.dao.policy': {
        eager: true,
        alias: 'policy',
        allow: ['id'],
      },
      'proposal.dao.policy.roles': {
        eager: true,
        alias: 'roles',
        allow: ['name', 'kind', 'accountIds', 'permissions'],
      },
      bounty: {
        eager: true,
      },
      'bounty.bountyClaims': {
        eager: true,
      },
      'bounty.bountyDoneProposals': {
        eager: true,
      },
    };

    return crudRequest;
  }
}
