import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CrudRequest, ParsedRequest } from '@nestjsx/crud';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  ProposalTemplate,
  ProposalTemplateDto,
  sharedProposalTemplateManyResponseToDTO,
  SharedProposalTemplateResponseDto,
  sharedProposalTemplateResponseToDTO,
  SharedProposalTemplatesResponse,
} from '@sputnik-v2/proposal-template';
import {
  AccountAccessGuard,
  BaseCrudRequestInterceptor,
  EntityQuery,
  FindOneParams,
  HttpCacheInterceptor,
  QueryFailedErrorFilter,
} from '@sputnik-v2/common';
import { SharedProposalTemplateService } from '@sputnik-v2/proposal-template/shared-proposal-template.service';

import { CouncilMemberGuard } from '../guards/council-member.guard';

@ApiTags('Proposals')
@Controller('/proposals')
export class SharedProposalTemplateController {
  constructor(
    private readonly sharedProposalTemplateService: SharedProposalTemplateService,
  ) {}

  @ApiQuery({ type: EntityQuery })
  @ApiResponse({
    status: 200,
    description: 'List of Shared Proposal Templates',
    type: SharedProposalTemplatesResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor, BaseCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @Get('/templates')
  async sharedProposalTemplates(
    @ParsedRequest() query: CrudRequest,
  ): Promise<
    SharedProposalTemplateResponseDto[] | SharedProposalTemplatesResponse
  > {
    const templates = await this.sharedProposalTemplateService.getMany(query);

    return sharedProposalTemplateManyResponseToDTO(templates);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Shared Proposal Template',
    type: SharedProposalTemplateResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid Shared Proposal Template ID' })
  @Get('/templates/:id')
  async byId(
    @Param() { id }: FindOneParams,
  ): Promise<SharedProposalTemplateResponseDto> {
    const template = await this.sharedProposalTemplateService.findOne(id);
    if (!template) {
      throw new BadRequestException('Invalid Shared Proposal Template ID');
    }

    return sharedProposalTemplateResponseToDTO(template);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Clone Shared Proposal Template to DAO',
    type: ProposalTemplateDto,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard, CouncilMemberGuard)
  @Post('/templates/:id/clone/:daoId')
  async createProposalTemplate(
    @Param('id') id: string,
    @Param('daoId') daoId: string,
  ): Promise<ProposalTemplate> {
    return this.sharedProposalTemplateService.cloneToDao(id, daoId);
  }
}
