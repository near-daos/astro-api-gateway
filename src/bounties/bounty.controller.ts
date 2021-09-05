import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FindOneParams, HttpCacheInterceptor } from 'src/common';
import { BountyService } from './bounty.service';
import { SortPipe } from 'src/common/pipes/sort.pipe';
import { Bounty } from './entities/bounty.entity';
import { BountyQuery } from './dto/bounty-query.dto';

@ApiTags('Bounty')
@Controller('/bounties')
export class BountyController {
  constructor(private readonly bountyService: BountyService) {}

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Sputnik DAO Bounties',
    type: Bounty,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'limit/offset must be a number conforming to the specified constraints',
  })
  @UseInterceptors(HttpCacheInterceptor)
  @Get('/')
  async bounties(@Query(new SortPipe()) query: BountyQuery): Promise<Bounty[]> {
    return await this.bountyService.find(query);
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
