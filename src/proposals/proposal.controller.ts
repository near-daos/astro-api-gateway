import {
  BadRequestException,
  CacheInterceptor,
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FindOneParams, PagingQuery } from 'src/common';
import { Proposal } from './entities/proposal.entity';
import { ProposalService } from './proposal.service';

@ApiTags('Proposals')
@Controller()
@UseInterceptors(CacheInterceptor)
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService
  ) { }

  @Get('/proposals')
  async proposals(@Query() query: PagingQuery): Promise<Proposal[]> {
    return await this.proposalService.find(query);
  }

  @Get('/proposals/:id')
  async proposalById(@Param() { id }: FindOneParams): Promise<Proposal> {
    const proposal: Proposal = await this.proposalService.findOne(id);

    if (!proposal) {
      throw new BadRequestException('Invalid Proposal ID')
    }

    return proposal;
  }
}
