import { Injectable } from '@nestjs/common';
import { CrudRequest } from '@nestjsx/crud';
import { DaoService } from '@sputnik-v2/dao';
import { ProposalService } from '@sputnik-v2/proposal';

import { DaoCrudRequestInterceptor } from '../dao/interceptors/dao-crud.interceptor';
import { ProposalCrudRequestInterceptor } from '../proposal/interceptors/proposal-crud.interceptor';
import { SearchResultDto } from './dto/search-result.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
  ) {}

  async search(
    req: CrudRequest,
    query: string,
    accountId?: string,
  ): Promise<SearchResultDto> {
    return {
      daos: await this.daoService.search(
        {
          ...req,
          parsed: {
            ...req.parsed,
            fields: DaoCrudRequestInterceptor.defaultFields,
          },
        },
        query,
      ),
      proposals: await this.proposalService.search(
        {
          ...req,
          parsed: {
            ...req.parsed,
            fields: ProposalCrudRequestInterceptor.defaultFields,
          },
        },
        query,
        accountId,
      ),
    } as SearchResultDto;
  }
}
