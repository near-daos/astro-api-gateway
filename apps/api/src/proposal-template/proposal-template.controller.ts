import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ProposalTemplate,
  ProposalTemplateService,
} from '@sputnik-v2/proposal-template';
import { AccountAccessGuard, AccountBearer } from '@sputnik-v2/common';
import { CouncilMemberGuard } from '../guards/council-member.guard';
import { ProposalTemplateBodyDto } from './dto/proposal-template-body.dto';

@ApiTags('DAO')
@Controller('/daos')
export class ProposalTemplateController {
  constructor(
    private readonly proposalTemplateService: ProposalTemplateService,
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
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @ApiNotFoundResponse({
    description: 'DAO <daoId> does not exist',
  })
  @UseGuards(AccountAccessGuard, CouncilMemberGuard)
  @Post('/:daoId/proposal-templates')
  async createProposalTemplate(
    @Param('daoId') daoId: string,
    @Body() { name, isEnabled, config }: ProposalTemplateBodyDto,
  ): Promise<ProposalTemplate> {
    return this.proposalTemplateService.create({
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
    description: 'Create DAO proposal template',
    type: ProposalTemplate,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @ApiNotFoundResponse({
    description: 'DAO <daoId> or proposal template <id> does not exist',
  })
  @UseGuards(AccountAccessGuard, CouncilMemberGuard)
  @Patch('/:daoId/proposal-templates/:id')
  async updateProposalTemplate(
    @Param('daoId') daoId: string,
    @Param('id') id: string,
    @Body() { name, isEnabled, config }: ProposalTemplateBodyDto,
  ): Promise<ProposalTemplate> {
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
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @ApiNotFoundResponse({
    description: 'DAO <daoId> or proposal template <id> does not exist',
  })
  @UseGuards(AccountAccessGuard, CouncilMemberGuard)
  @Delete('/:daoId/proposal-templates/:id')
  async deleteProposalTemplate(
    @Param('daoId') daoId: string,
    @Param('id') id: string,
    @Body() body: AccountBearer,
  ): Promise<void> {
    await this.proposalTemplateService.delete(id);
  }
}
