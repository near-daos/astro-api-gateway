import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpCacheInterceptor, SearchQuery } from 'src/common';
import { SortPipe } from 'src/common/pipes/sort.pipe';
import { SearchResultDto } from './dto/search-result.dto';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller()
@UseInterceptors(HttpCacheInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiResponse({
    status: 200,
    description: 'Search results: dao/proposals combined',
    type: SearchResultDto,
  })
  @ApiBadRequestResponse({ description: 'query should not be empty' })
  @Get('/search')
  async search(
    @Query(new SortPipe()) query: SearchQuery,
  ): Promise<SearchResultDto> {
    return await this.searchService.search(query);
  }
}
