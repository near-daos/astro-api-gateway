import {
  Controller,
  Get,
  Query,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParsedRequest, CrudRequest } from '@nestjsx/crud';
import {
  HttpCacheInterceptor,
  SearchQuery,
  QueryFailedErrorFilter,
  BaseCrudRequestInterceptor,
} from '@sputnik-v2/common';

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
  @UseInterceptors(HttpCacheInterceptor, BaseCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @Get('/search')
  async search(
    @ParsedRequest() req: CrudRequest,
    @Query() query: SearchQuery,
  ): Promise<SearchResultDto> {
    return await this.searchService.search(req, query);
  }
}
