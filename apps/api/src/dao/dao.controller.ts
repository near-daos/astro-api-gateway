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
import { DaoService, Dao, DaoResponse, DaoMemberVote } from '@sputnik-v2/dao';

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
    const dao: Dao = await this.daoService.findById(id);

    if (!dao) {
      throw new BadRequestException('Invalid Dao ID');
    }

    return dao;
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'DAO Members',
    type: DaoMemberVote,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Invalid Dao ID' })
  @UseInterceptors(HttpCacheInterceptor)
  @Get('/:id/members')
  async daoMembers(@Param() { id }: FindOneParams): Promise<DaoMemberVote[]> {
    return this.daoService.getDaoMemberVotes(id);
  }
}
