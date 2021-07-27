import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Proposal } from './entities/proposal.entity';
import { ProposalService } from './proposal.service';

@Controller()
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService
  ) { }

  @ApiExcludeEndpoint()
  @Get('/proposals')
  async proposals(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number
  ): Promise<any[]> {
    return await this.proposalService.find({ take: limit, skip: offset })
  }

  @ApiExcludeEndpoint()
  @Get('/proposals/:id')
  async proposalById(@Param('id') id: string): Promise<Proposal> {
    const proposal: Proposal = await this.proposalService.findOne(id);

    if (!proposal) {
      throw new BadRequestException('Invalid Proposal ID')
    }

    return proposal;
  }
}
