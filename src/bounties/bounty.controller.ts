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
import {
  ParsedRequest,
  CrudRequest,
} from '@nestjsx/crud';
import { FindOneParams, HttpCacheInterceptor } from 'src/common';
import { EntityQuery } from 'src/common/dto/EntityQuery';
import { QueryFailedErrorFilter } from 'src/common/filters/query-failed-error.filter';
import { BountyService } from './bounty.service';
import { BountyResponse } from './dto/bounty-response.dto';
import { Bounty } from './entities/bounty.entity';
import { BountyCrudRequestInterceptor } from './interceptors/bounty-crud.interceptor';

@ApiTags('Bounty')
@Controller('/bounties')
export class BountyController {
  constructor(private readonly bountyService: BountyService) {}

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
  @Get('/')
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
  @Get('/:id')
  async bountyById(@Param() { id }: FindOneParams): Promise<Bounty> {
    const bounty: Bounty = await this.bountyService.findOne(id);

    if (!bounty) {
      throw new BadRequestException('Invalid Bounty ID');
    }

    return bounty;
  }
}
