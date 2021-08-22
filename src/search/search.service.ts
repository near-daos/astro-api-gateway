import { Injectable } from '@nestjs/common';
import { SearchQuery } from 'src/common';
import { DaoService } from 'src/daos/dao.service';
import { ProposalService } from 'src/proposals/proposal.service';
import { SearchResultDto } from './dto/search-result.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
  ) {}

  async search(query: SearchQuery): Promise<SearchResultDto> {
    return {
      daos: await this.daoService.findByQuery(query),
      proposals: await this.proposalService.findByQuery(query),
    } as SearchResultDto;
  }
}
