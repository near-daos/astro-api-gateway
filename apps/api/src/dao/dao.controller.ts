import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ParsedRequest, CrudRequest } from '@nestjsx/crud';
import {
  FindOneParams,
  HttpCacheInterceptor,
  EntityQuery,
  QueryFailedErrorFilter,
  FindAccountParams,
} from '@sputnik-v2/common';
import {
  DaoService,
  Dao,
  DaoResponse,
  DaoFeed,
  DaoFeedResponse,
} from '@sputnik-v2/dao';

import { DaoCrudRequestInterceptor } from './interceptors/dao-crud.interceptor';

@ApiTags('DAO')
@Controller('/daos')
export class DaoController {
  constructor(private readonly daoService: DaoService) {}

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Sputnik DAOs',
    type: DaoResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor, DaoCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @ApiQuery({ type: EntityQuery })
  @Get('/')
  async daos(
    @ParsedRequest() query: CrudRequest,
  ): Promise<Dao[] | DaoResponse> {
    return await this.daoService.getMany(query);
  }

  @ApiResponse({
    status: 200,
    description: 'Sputnik DAOs Feed',
    type: DaoResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor, DaoCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @ApiQuery({ type: EntityQuery })
  @Get('/feed')
  async daosFeed(
    @ParsedRequest() query: CrudRequest,
  ): Promise<DaoFeed[] | DaoFeedResponse> {
    return await this.daoService.getFeed(query);
  }

  @ApiResponse({
    status: 200,
    description: 'Sputnik DAO Feed',
    type: DaoFeed,
  })
  @ApiBadRequestResponse({ description: 'Invalid Dao ID' })
  @UseInterceptors(HttpCacheInterceptor)
  @ApiParam({
    name: 'id',
    type: String,
  })
  @Get('/feed/:id')
  async daoFeed(@Param() { id }: FindOneParams): Promise<DaoFeed> {
    const daoFeed = await this.daoService.getDaoFeed(id);

    if (!daoFeed) {
      throw new BadRequestException('Invalid Dao ID');
    }

    return daoFeed;
  }

  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Sputnik DAO',
    type: Dao,
  })
  @ApiBadRequestResponse({ description: 'Invalid accountId' })
  @UseInterceptors(HttpCacheInterceptor)
  @Get('/account-daos/:accountId')
  async daosByAccountId(
    @Param() { accountId }: FindAccountParams,
  ): Promise<Dao[] | DaoResponse> {
    return await this.daoService.findAccountDaos(accountId);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Sputnik DAO',
    type: Dao,
  })
  @ApiBadRequestResponse({ description: 'Invalid Dao ID' })
  @UseInterceptors(HttpCacheInterceptor)
  @Get('/:id')
  async daoById(@Param() { id }: FindOneParams): Promise<Dao> {
    const dao: Dao = await this.daoService.findOne(id);

    if (!dao) {
      throw new BadRequestException('Invalid Dao ID');
    }

    return dao;
  }
}
