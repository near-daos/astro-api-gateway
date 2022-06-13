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
import {
  CloseDraftProposal,
  CreateDraftProposal,
  DraftProposalBasicResponse,
  DraftProposalRequest,
  DraftProposalResponse,
  DraftProposalService,
  DraftProposalsRequest,
  UpdateDraftProposal,
} from '@sputnik-v2/draft-proposal';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  AccountAccessGuard,
  AuthorizedRequest,
  BaseResponseDto,
} from '@sputnik-v2/common';

@ApiTags('Draft Proposals')
@Controller('/draft-proposals')
export class DraftProposalController {
  constructor(private readonly draftProposalService: DraftProposalService) {}

  @ApiResponse({
    status: 200,
    description: 'List of Draft Proposals',
    type: DraftProposalBasicResponse,
  })
  @Get('/')
  getDraftProposals(
    @Query() query: DraftProposalsRequest,
  ): Promise<BaseResponseDto<DraftProposalBasicResponse>> {
    return this.draftProposalService.getAll(query);
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
    @Param('id') id: string,
    @Query() query: DraftProposalRequest,
  ): Promise<DraftProposalResponse> {
    return this.draftProposalService.getOneById(id, query);
  }

  @ApiResponse({
    status: 201,
    description: 'Created',
    type: String,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiBearerAuth()
  @UseGuards(ThrottlerGuard)
  @UseGuards(AccountAccessGuard)
  @Post()
  createDraftProposals(
    @Req() req: AuthorizedRequest,
    @Body() body: CreateDraftProposal,
  ): Promise<string> {
    return this.draftProposalService.create(req.accountId, body);
  }

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
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId / not proposer',
  })
  @ApiBearerAuth()
  @UseGuards(ThrottlerGuard)
  @UseGuards(AccountAccessGuard)
  @Patch('/:id')
  updateDraftProposals(
    @Param('id') id: string,
    @Req() req: AuthorizedRequest,
    @Body() body: UpdateDraftProposal,
  ): Promise<string> {
    return this.draftProposalService.update(id, req.accountId, body);
  }

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
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId / not proposer',
  })
  @ApiNotFoundResponse({
    description: 'Draft proposal <id> does not exist',
  })
  @ApiBadRequestResponse({
    description: 'Draft proposal <id> is closed',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Delete('/:id')
  deleteDraftProposal(
    @Param('id') id: string,
    @Req() req: AuthorizedRequest,
  ): Promise<boolean> {
    return this.draftProposalService.delete(id, req.accountId);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
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
  @Post('/:id/view')
  viewDraftProposal(@Param('id') id: string, @Req() req: AuthorizedRequest) {
    return this.draftProposalService.view(id, req.accountId);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
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
  @Post('/:id/save')
  saveDraftProposal(@Param('id') id: string, @Req() req: AuthorizedRequest) {
    return this.draftProposalService.save(id, req.accountId);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Saved',
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
    description: 'Draft proposal <id> is closed',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/:id/close')
  closeDraftProposal(
    @Param('id') id: string,
    @Req() req: AuthorizedRequest,
    @Body() body: CloseDraftProposal,
  ) {
    return this.draftProposalService.close(id, req.accountId, body);
  }
}
