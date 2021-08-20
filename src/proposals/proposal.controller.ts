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
import { ProposalQuery } from './dto/proposal-query.dto';
import { Proposal } from './entities/proposal.entity';
import { ProposalService } from './proposal.service';

@ApiTags('Proposals')
@Controller()
@UseInterceptors(HttpCacheInterceptor)
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Sputnik DAO Proposals',
    type: Proposal,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'limit/offset must be a number conforming to the specified constraints',
  })
  @Get('/proposals')
  async proposals(@Query() query: ProposalQuery): Promise<Proposal[]> {
    return await this.proposalService.find(query);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Sputnik DAO Proposal',
    type: Proposal,
  })
  @ApiBadRequestResponse({ description: 'Invalid Proposal ID' })
  @Get('/proposals/:id')
  async proposalById(@Param() { id }: FindOneParams): Promise<Proposal> {
    const proposal: Proposal = await this.proposalService.findOne(id);

    if (!proposal) {
      throw new BadRequestException('Invalid Proposal ID');
    }

    return proposal;
  }
}
