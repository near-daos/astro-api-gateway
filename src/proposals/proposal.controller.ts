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
  GetManyDefaultResponse,
} from '@nestjsx/crud';
import { FindOneParams, HttpCacheInterceptor } from 'src/common';
import { QueryParams } from 'src/common/dto/QueryParams';
import { Proposal } from './entities/proposal.entity';
import { ProposalOrmService } from './proposal-orm.service';
import { ProposalService } from './proposal.service';

@ApiTags('Proposals')
@Controller()
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly proposalOrmService: ProposalOrmService,
  ) {}

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
  @UseInterceptors(HttpCacheInterceptor, CrudRequestInterceptor)
  @ApiQuery({ type: QueryParams })
  @Get('/proposals')
  async proposals(
    @ParsedRequest() query: CrudRequest,
  ): Promise<Proposal[] | GetManyDefaultResponse<Proposal>> {
    return await this.proposalOrmService.getMany(query);
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
