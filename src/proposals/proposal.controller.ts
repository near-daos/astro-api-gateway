import {
  BadRequestException,
  Controller,
  Get,
  Param,
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
  CrudRequestInterceptor,
} from '@nestjsx/crud';
import { FindOneParams, HttpCacheInterceptor } from 'src/common';
import { QueryParams } from 'src/common/dto/QueryParams';
import { ProposalResponse } from './dto/proposal-response.dto';
import { Proposal } from './entities/proposal.entity';
import { ProposalService } from './proposal.service';

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
    description:
      'limit/offset must be a number conforming to the specified constraints',
  })
  @UseInterceptors(HttpCacheInterceptor, CrudRequestInterceptor)
  @ApiQuery({ type: QueryParams })
  @Get('/proposals')
  async proposals(
    @ParsedRequest() query: CrudRequest,
  ): Promise<Proposal[] | ProposalResponse> {
    return await this.proposalService.getMany(query);
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
