import { Controller, Get, Query } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { SearchQuery } from 'src/common';
import { SearchResultDto } from './dto/search-result.dto';
import { SearchService } from './search.service';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @ApiExcludeEndpoint()
  @Get('/search')
  async search(@Query() query: SearchQuery): Promise<SearchResultDto> {
    return await this.searchService.search(query)
  }
}
