import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Span } from 'nestjs-ddtrace';

import {
  ProposalTemplate,
  ProposalTemplateService,
} from '@sputnik-v2/proposal-template';
import { AccountAccessGuard, AuthorizedRequest } from '@sputnik-v2/common';
import { SharedProposalTemplateService } from '@sputnik-v2/proposal-template/shared-proposal-template.service';

import { CouncilMemberGuard } from '../guards/council-member.guard';
import { ProposalTemplateBodyDto } from './dto/proposal-template-body.dto';
import { DynamoProposalTemplateService } from '@sputnik-v2/proposal-template/dynamo-proposal-template.service';
import { DynamoSharedProposalTemplateService } from '@sputnik-v2/proposal-template/dynamo-shared-proposal-template.service';

@Span()
@ApiTags('DAO')
@Controller('/daos')
export class ProposalTemplateController {
  constructor(
    private readonly proposalTemplateService: ProposalTemplateService,
    private readonly sharedProposalTemplateService: SharedProposalTemplateService,
    private readonly dynamoProposalTemplateService: DynamoProposalTemplateService,
    private readonly dynamoSharedProposalTemplateService: DynamoSharedProposalTemplateService,
  ) {}

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Get DAO proposal templates',
    type: ProposalTemplate,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'DAO <daoId> does not exist',
  })
  @Get('/:daoId/proposal-templates')
  async getDaoProposalTemplates(
    @Param('daoId') daoId: string,
  ): Promise<ProposalTemplate[]> {
    return this.proposalTemplateService.findDaoProposalTemplates(daoId);
  }

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Create DAO proposal template',
    type: ProposalTemplate,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiNotFoundResponse({
    description: 'DAO <daoId> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard, CouncilMemberGuard)
  @Post('/:daoId/proposal-templates')
  async createProposalTemplate(
    @Req() req: AuthorizedRequest,
    @Param('daoId') daoId: string,
    @Body() { name, description, isEnabled, config }: ProposalTemplateBodyDto,
  ): Promise<ProposalTemplate> {
    const proposalTemplate = {
      name,
      description,
      daoId,
      config,
    };

    await this.dynamoSharedProposalTemplateService.create({
      ...proposalTemplate,
      createdBy: req.accountId,
    });

    await this.dynamoProposalTemplateService.create({
      ...proposalTemplate,
      isEnabled,
    });

    await this.sharedProposalTemplateService.create({
      ...proposalTemplate,
      createdBy: req.accountId,
    });

    return this.proposalTemplateService.create({
      ...proposalTemplate,
      isEnabled,
    });
  }

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Create DAO proposal template',
    type: ProposalTemplate,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiNotFoundResponse({
    description: 'DAO <daoId> or proposal template <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard, CouncilMemberGuard)
  @Patch('/:daoId/proposal-templates/:id')
  async updateProposalTemplate(
    @Param('daoId') daoId: string,
    @Param('id') id: string,
    @Body() { name, isEnabled, config }: ProposalTemplateBodyDto,
  ): Promise<ProposalTemplate> {
    await this.dynamoProposalTemplateService.update(id, {
      daoId,
      name,
      isEnabled,
      config,
    });

    return this.proposalTemplateService.update(id, {
      daoId,
      name,
      isEnabled,
      config,
    });
  }

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Proposal template deleted',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiNotFoundResponse({
    description: 'DAO <daoId> or proposal template <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard, CouncilMemberGuard)
  @Delete('/:daoId/proposal-templates/:id')
  async deleteProposalTemplate(
    @Param('daoId') daoId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.dynamoProposalTemplateService.delete(daoId, id);
    await this.proposalTemplateService.delete(id);
  }
}
