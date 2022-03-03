import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
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
  EntityQuery,
  QueryFailedErrorFilter,
  AccountAccessGuard,
} from '@sputnik-v2/common';
import {
  BountyService,
  BountyResponse,
  Bounty,
  BountyContextService,
  BountyContext,
  BountyContextResponse,
} from '@sputnik-v2/bounty';

import { BountyCrudRequestInterceptor } from './interceptors/bounty-crud.interceptor';
import { BountyContextCrudRequestInterceptor } from './interceptors/bounty-context-crud.interceptor';
import { CouncilMemberGuard } from '../guards/council-member.guard';
import { DeleteBountyBodyDto } from './dto/delete-bounty.dto';

@ApiTags('Bounty')
@Controller()
export class BountyController {
  constructor(
    private readonly bountyService: BountyService,
    private readonly bountyContextService: BountyContextService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Sputnik DAO Bounties',
    type: BountyResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor, BountyCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @ApiQuery({ type: EntityQuery })
  @Get('/bounties')
  async bounties(
    @ParsedRequest() query: CrudRequest,
  ): Promise<Bounty[] | BountyResponse> {
    return await this.bountyService.getMany(query);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Sputnik DAO Bounty',
    type: Bounty,
  })
  @ApiBadRequestResponse({ description: 'Invalid Bounty ID' })
  @UseInterceptors(HttpCacheInterceptor)
  @Get('/bounties/:id')
  async bountyById(@Param() { id }: FindOneParams): Promise<Bounty> {
    const bounty: Bounty = await this.bountyService.findOne(id);

    if (!bounty) {
      throw new BadRequestException('Invalid Bounty ID');
    }

    return bounty;
  }

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Sputnik DAO Bounties',
    type: BountyContextResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor, BountyContextCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @ApiQuery({ type: EntityQuery })
  @ApiQuery({
    name: 'accountId',
    required: false,
    type: String,
  })
  @Get('/bounty-contexts')
  async bountyContexts(
    @ParsedRequest() query: CrudRequest,
    @Query('accountId') accountId?: string,
  ): Promise<BountyContext[] | BountyContextResponse> {
    return await this.bountyContextService.getMany(query, accountId);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted',
    type: Bounty,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @ApiNotFoundResponse({
    description: `No Bounty '<id>' found.`,
  })
  @UseGuards(AccountAccessGuard, CouncilMemberGuard)
  @Delete('/bounties/:id')
  async deleteById(
    @Param() { id }: FindOneParams,
    @Body() { daoId }: DeleteBountyBodyDto,
  ): Promise<Bounty> {
    return this.bountyService.deleteBounty(id, daoId);
  }
}
