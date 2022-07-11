import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CrudRequest, ParsedRequest } from '@nestjsx/crud';
import { Span } from 'nestjs-ddtrace';

import {
  EntityQuery,
  FindAccountParams,
  FindOneParams,
  HttpCacheInterceptor,
  QueryFailedErrorFilter,
  ValidAccountGuard,
} from '@sputnik-v2/common';
import {
  AccountDaoResponse,
  Dao,
  DaoMemberVote,
  DaoPageResponse,
  DaoResponseV1,
  DaoResponseV2,
  DaoService,
} from '@sputnik-v2/dao';
import { DelegationDto } from '@sputnik-v2/dao/dto/delegation.dto';

import { DaoCrudRequestInterceptor } from './interceptors/dao-crud.interceptor';

@Span()
@ApiTags('DAO')
@Controller('/daos')
export class DaoController {
  constructor(private readonly daoService: DaoService) {}

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Sputnik DAOs',
    type: DaoPageResponse,
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
  ): Promise<Dao[] | DaoPageResponse> {
    return await this.daoService.getMany(query);
  }

  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of Sputnik DAOs by Account',
    isArray: true,
    type: AccountDaoResponse,
  })
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Dao ID',
  })
  @UseInterceptors(HttpCacheInterceptor)
  @UseGuards(ValidAccountGuard)
  @Get('/account-daos/:accountId')
  async daosByAccountId(
    @Param() { accountId }: FindAccountParams,
  ): Promise<AccountDaoResponse[]> {
    return await this.daoService.findAccountDaos(
      accountId,
      DaoCrudRequestInterceptor.defaultFields,
    );
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
  async daoById(@Param() { id }: FindOneParams): Promise<DaoResponseV1> {
    const dao = await this.daoService.findById(id);

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
    description: 'Sputnik DAO',
    type: Dao,
  })
  @ApiBadRequestResponse({ description: 'Invalid Dao ID' })
  @UseInterceptors(HttpCacheInterceptor)
  @Version('2')
  @Get('/:id')
  async daoByIdV2(@Param() { id }: FindOneParams): Promise<DaoResponseV2> {
    return this.daoService.findByIdV2(id);
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

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'DAO Delegations',
    type: DelegationDto,
    isArray: true,
  })
  @UseInterceptors(HttpCacheInterceptor)
  @Get('/:id/delegations')
  async delegations(@Param() { id }: FindOneParams): Promise<DelegationDto[]> {
    return this.daoService.getDelegationsByDaoId(id);
  }
}
