import { Injectable } from '@nestjs/common';
import { CrudRequest } from '@nestjsx/crud';
import { DaoService } from '@sputnik-v2/dao';
import { ProposalService } from '@sputnik-v2/proposal';

import { SearchResultDto } from './dto/search-result.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
  ) {}

  async search(req: CrudRequest, query: string): Promise<SearchResultDto> {
    return {
      daos: await this.daoService.search(req, query),
      proposals: await this.proposalService.search(req, query),
    } as SearchResultDto;
  }
}
