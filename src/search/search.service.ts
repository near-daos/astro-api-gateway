import { Injectable } from '@nestjs/common';
import { CrudRequest } from '@nestjsx/crud';
import { DaoService } from 'src/daos/dao.service';
import { ProposalService } from 'src/proposals/proposal.service';
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
