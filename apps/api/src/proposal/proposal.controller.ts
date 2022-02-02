import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
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
  FindAccountParams,
  QueryFailedErrorFilter,
} from '@sputnik-v2/common';
import {
  ProposalResponse,
  Proposal,
  ProposalService,
} from '@sputnik-v2/proposal';

import { ProposalCrudRequestInterceptor } from './interceptors/proposal-crud.interceptor';

@ApiTags('Proposals')
@Controller()
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Sputnik DAO Proposals',
    type: ProposalResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor, ProposalCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @ApiQuery({ type: EntityQuery })
  @ApiQuery({
    name: 'accountId',
    required: false,
    type: String,
  })
  @Get('/proposals')
  async proposals(
    @ParsedRequest() query: CrudRequest,
    @Query('accountId') accountId?: string,
  ): Promise<Proposal[] | ProposalResponse> {
    return await this.proposalService.getFeed(query, accountId);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiQuery({
    name: 'accountId',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Sputnik DAO Proposal',
    type: Proposal,
  })
  @ApiBadRequestResponse({ description: 'Invalid Proposal ID' })
  @Get('/proposals/:id')
  async proposalById(
    @Param() { id }: FindOneParams,
    @Query('accountId') accountId?: string,
  ): Promise<Proposal> {
    return await this.proposalService.getById(id, accountId);
  }

  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of Proposals by Account',
    type: ProposalResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor, ProposalCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @ApiQuery({ type: EntityQuery })
  @Get('/proposals/account-proposals/:accountId')
  async proposalByAccount(
    @ParsedRequest() query: CrudRequest,
    @Param() { accountId }: FindAccountParams,
  ): Promise<Proposal[] | ProposalResponse> {
    return await this.proposalService.getFeedByAccountId(accountId, query);
  }
}
