import {
  Controller,
  Get,
  Param,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ParsedRequest, CrudRequest } from '@nestjsx/crud';
import {
  FindOneParams,
  HttpCacheInterceptor,
  QueryFailedErrorFilter,
  ValidAccountGuard,
} from '@sputnik-v2/common';
import {
  ProposalResponse,
  Proposal,
  ProposalService,
  AccountProposalQuery,
  ProposalQuery,
} from '@sputnik-v2/proposal';

import { ProposalCrudRequestInterceptor } from './interceptors/proposal-crud.interceptor';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

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
  @Get('/proposals')
  async proposals(
    @ParsedRequest() query: CrudRequest,
    @Query() params: AccountProposalQuery,
  ): Promise<Proposal[] | ProposalResponse> {
    return await this.proposalService.getFeed(query, params);
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
  @Throttle(5, 1)
  @UseGuards(ThrottlerGuard)
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
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseGuards(ValidAccountGuard)
  @UseInterceptors(HttpCacheInterceptor, ProposalCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @Get('/proposals/account-proposals/:accountId')
  async proposalByAccount(
    @ParsedRequest() query: CrudRequest,
    @Query() params: ProposalQuery,
    @Param('accountId') accountId: string,
  ): Promise<Proposal[] | ProposalResponse> {
    return await this.proposalService.getFeedByAccountId(
      accountId,
      query,
      params,
    );
  }
}
