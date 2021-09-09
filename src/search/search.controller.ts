import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CrudRequestInterceptor,
  ParsedRequest,
  CrudRequest,
} from '@nestjsx/crud';
import { HttpCacheInterceptor, SearchQuery } from 'src/common';
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
  @UseInterceptors(HttpCacheInterceptor, CrudRequestInterceptor)
  @ApiQuery({ type: SearchQuery })
  @Get('/search')
  async search(
    @ParsedRequest() req: CrudRequest,
    @Query('query') query: string,
  ): Promise<SearchResultDto> {
    return await this.searchService.search(req, query);
  }
}
