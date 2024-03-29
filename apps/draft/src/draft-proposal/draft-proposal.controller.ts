import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Span } from 'nestjs-ddtrace';

import {
  CloseDraftProposal,
  CreateDraftProposal,
  DraftProposalBasicResponse,
  DraftProposalRequest,
  DraftProposalResponse,
  DraftProposalsRequest,
  UpdateDraftProposal,
} from '@sputnik-v2/draft-proposal';
import {
  AccountAccessGuard,
  AuthorizedRequest,
  BaseResponseDto,
  DeleteResponse,
  FindOneMongoDaoParams,
  FindOneMongoParams,
} from '@sputnik-v2/common';
import { DraftPageResponse } from './dto/draft-page-response.dto';
import { DraftProposalServiceFacade } from '@sputnik-v2/draft-proposal/draft-proposal-service-facade';

@Span()
@ApiTags('Draft Proposals')
@Controller('/draft-proposals')
export class DraftProposalController {
  constructor(
    private readonly draftProposalServiceFacade: DraftProposalServiceFacade,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'List of Draft Proposals',
    type: DraftPageResponse,
  })
  @Get('/')
  getDraftProposals(
    @Query() query: DraftProposalsRequest,
  ): Promise<BaseResponseDto<DraftProposalBasicResponse>> {
    return this.draftProposalServiceFacade.getAll(query);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of Draft Proposals',
    type: DraftProposalResponse,
  })
  @ApiNotFoundResponse({
    description: 'Draft proposal <id> does not exist',
  })
  @Get('/:id')
  getDraftProposal(
    @Param() { id }: FindOneMongoParams,
    @Query() query: DraftProposalRequest,
  ): Promise<DraftProposalResponse> {
    return this.draftProposalServiceFacade.getOneById(id, query);
  }

  @ApiResponse({
    status: 201,
    description: 'Created',
    type: String,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId / no permissions',
  })
  @ApiForbiddenResponse({
    description: 'Invalid DAO ID',
  })
  @ApiBearerAuth()
  @UseGuards(ThrottlerGuard)
  @UseGuards(AccountAccessGuard)
  @Post()
  async createDraftProposals(
    @Req() req: AuthorizedRequest,
    @Body() body: CreateDraftProposal,
  ): Promise<string> {
    return this.draftProposalServiceFacade.create(req.accountId, body);
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
    description: 'Updated',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Draft proposal <id> does not exist',
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId / no permissions / not proposer or council',
  })
  @ApiBearerAuth()
  @UseGuards(ThrottlerGuard)
  @UseGuards(AccountAccessGuard)
  @Patch('/:daoId/:id')
  async updateDraftProposals(
    @Param() { daoId, id }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
    @Body() body: UpdateDraftProposal,
  ): Promise<string> {
    return this.draftProposalServiceFacade.update(
      daoId,
      id,
      req.accountId,
      body,
    );
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
    description: 'Deleted',
    type: Boolean,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId / not proposer or council',
  })
  @ApiNotFoundResponse({
    description: 'Draft proposal <id> does not exist',
  })
  @ApiBadRequestResponse({
    description: 'Draft proposal <id> is closed',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Delete('/:daoId/:id')
  deleteDraftProposal(
    @Param() { daoId, id }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
  ): Promise<DeleteResponse> {
    return this.draftProposalServiceFacade.delete(daoId, id, req.accountId);
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
    status: 201,
    description: 'Viewed',
    type: Boolean,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiNotFoundResponse({
    description: 'Draft proposal <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/:daoId/:id/view')
  viewDraftProposal(
    @Param() { daoId, id }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
  ) {
    return this.draftProposalServiceFacade.view(daoId, id, req.accountId);
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
    status: 201,
    description: 'Saved',
    type: Boolean,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiNotFoundResponse({
    description: 'Draft proposal <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/:daoId/:id/save')
  async saveDraftProposal(
    @Param() { daoId, id }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
  ) {
    return this.draftProposalServiceFacade.save(daoId, id, req.accountId);
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
    description: 'Save Removed',
    type: Boolean,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiNotFoundResponse({
    description: 'Draft proposal <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Delete('/:daoId/:id/save')
  async removeDraftProposalSave(
    @Param() { daoId, id }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
  ) {
    return this.draftProposalServiceFacade.removeSave(daoId, id, req.accountId);
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
    status: 201,
    description: 'Closed',
    type: Boolean,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId / not proposer',
  })
  @ApiNotFoundResponse({
    description: 'Draft proposal <id> does not exist',
  })
  @ApiBadRequestResponse({
    description: 'Proposal ID should not be empty',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/:daoId/:id/close')
  closeDraftProposal(
    @Param() { daoId, id }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
    @Body() body: CloseDraftProposal,
  ) {
    return this.draftProposalServiceFacade.close(
      daoId,
      id,
      req.accountId,
      body,
    );
  }
}
