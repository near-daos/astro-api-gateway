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

import { FindOneParams, HttpCacheInterceptor } from 'src/common';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';
import { EntityQuery } from 'src/common/dto/EntityQuery';
import { DaoResponse } from './dto/dao-response.dto';
import { DaoCrudRequestInterceptor } from './interceptors/dao-crud.interceptor';
import { QueryFailedErrorFilter } from 'src/common/filters/query-failed-error.filter';
import { DaoNearService } from './dao-near.service';
import { FindAccountParams } from 'src/common/dto/FindAccountParams';
import { DaoFeed } from './dto/dao-feed.dto';
import { DaoFeedResponse } from './dto/dao-feed-response.dto';

@ApiTags('DAO')
@Controller('/daos')
export class DaoController {
  constructor(
    private readonly daoService: DaoService,
    private readonly daoNearService: DaoNearService,
  ) {}

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
