import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { FindOneParams, PagingQuery } from 'src/common';
import { Proposal } from './entities/proposal.entity';
import { ProposalService } from './proposal.service';

@Controller()
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService
  ) { }

  @ApiExcludeEndpoint()
  @Get('/proposals')
  async proposals(@Query() { limit, offset }: PagingQuery): Promise<any[]> {
    return await this.proposalService.find({ take: limit, skip: offset })
  }

  @ApiExcludeEndpoint()
  @Get('/proposals/:id')
  async proposalById(@Param() { id }: FindOneParams): Promise<Proposal> {
    const proposal: Proposal = await this.proposalService.findOne(id);

    if (!proposal) {
      throw new BadRequestException('Invalid Proposal ID')
    }

    return proposal;
  }
}
