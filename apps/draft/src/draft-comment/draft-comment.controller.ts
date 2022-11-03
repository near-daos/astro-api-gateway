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
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Span } from 'nestjs-ddtrace';

import {
  AccountAccessGuard,
  AuthorizedRequest,
  BaseResponseDto,
  DeleteResponse,
} from '@sputnik-v2/common';
import {
  CreateDraftComment,
  DraftCommentContextParams,
  DraftCommentResponse,
  DraftCommentsRequest,
  UpdateDraftComment,
} from '@sputnik-v2/draft-comment';
import { DraftCommentPageResponse } from './dto/draft-comment-page-response.dto';
import { DraftCommentServiceFacade } from '@sputnik-v2/draft-comment/draft-comment-service-facade';

@Span()
@ApiTags('Draft Comments')
@Controller('/draft-comments')
export class DraftCommentController {
  constructor(
    private readonly draftCommentService: DraftCommentServiceFacade,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'List of Draft Comments',
    type: DraftCommentPageResponse,
  })
  @Get('/')
  getDraftComments(
    @Query() query: DraftCommentsRequest,
  ): Promise<BaseResponseDto<DraftCommentResponse>> {
    return this.draftCommentService.getAll(query);
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
  @ApiNotFoundResponse({
    description: 'Draft proposal / reply comment <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(ThrottlerGuard)
  @UseGuards(AccountAccessGuard)
  @Post()
  createDraftComment(
    @Req() req: AuthorizedRequest,
    @Body() body: CreateDraftComment,
  ): Promise<string> {
    return this.draftCommentService.create(req.accountId, body);
  }

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiParam({
    name: 'draftId',
    type: String,
  })
  @ApiParam({
    name: 'commentId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Updated',
    type: String,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId / not author',
  })
  @ApiNotFoundResponse({
    description: 'Draft comment <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(ThrottlerGuard)
  @UseGuards(AccountAccessGuard)
  @Patch('/:daoId/:draftId/:commentId')
  updateDraftComment(
    @Param() params: DraftCommentContextParams,
    @Req() req: AuthorizedRequest,
    @Body() body: UpdateDraftComment,
  ): Promise<string> {
    return this.draftCommentService.update(
      { ...params, accountId: req.accountId },
      body,
    );
  }

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiParam({
    name: 'draftId',
    type: String,
  })
  @ApiParam({
    name: 'commentId',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Liked',
    type: Boolean,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiNotFoundResponse({
    description: 'Draft comment <id> does not exist',
  })
  @ApiBadRequestResponse({
    description: 'Draft comment <id> is disliked by <accountId>',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/:daoId/:draftId/:commentId/like')
  likeDraftComment(
    @Param() params: DraftCommentContextParams,
    @Req() req: AuthorizedRequest,
  ): Promise<boolean> {
    return this.draftCommentService.like({
      ...params,
      accountId: req.accountId,
    });
  }

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiParam({
    name: 'draftId',
    type: String,
  })
  @ApiParam({
    name: 'commentId',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Unliked',
    type: Boolean,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiNotFoundResponse({
    description: 'Draft comment <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/:daoId/:draftId/:commentId/remove-like')
  removeLikeFromDraftComment(
    @Param() params: DraftCommentContextParams,
    @Req() req: AuthorizedRequest,
  ): Promise<boolean> {
    return this.draftCommentService.removeLike({
      ...params,
      accountId: req.accountId,
    });
  }

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiParam({
    name: 'draftId',
    type: String,
  })
  @ApiParam({
    name: 'commentId',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Disliked',
    type: Boolean,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiNotFoundResponse({
    description: 'Draft comment <id> does not exist',
  })
  @ApiBadRequestResponse({
    description: 'Draft comment <id> is liked by <accountId>',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/:daoId/:draftId/:commentId/dislike')
  dislikeDraftComment(
    @Param() params: DraftCommentContextParams,
    @Req() req: AuthorizedRequest,
  ): Promise<boolean> {
    return this.draftCommentService.dislike({
      ...params,
      accountId: req.accountId,
    });
  }

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiParam({
    name: 'draftId',
    type: String,
  })
  @ApiParam({
    name: 'commentId',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Dislike Removed',
    type: Boolean,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId',
  })
  @ApiNotFoundResponse({
    description: 'Draft comment <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/:daoId/:draftId/:commentId/remove-dislike')
  async removeDislikeFromDraftComment(
    @Param() params: DraftCommentContextParams,
    @Req() req: AuthorizedRequest,
  ): Promise<boolean> {
    return this.draftCommentService.removeDislike({
      ...params,
      accountId: req.accountId,
    });
  }

  @ApiParam({
    name: 'daoId',
    type: String,
  })
  @ApiParam({
    name: 'draftId',
    type: String,
  })
  @ApiParam({
    name: 'commentId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted',
    type: Boolean,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId / not author or council',
  })
  @ApiNotFoundResponse({
    description: 'Draft comment <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Delete('/:daoId/:draftId/:commentId/')
  deleteDraftComment(
    @Param() params: DraftCommentContextParams,
    @Req() req: AuthorizedRequest,
  ): Promise<DeleteResponse> {
    return this.draftCommentService.delete({
      ...params,
      accountId: req.accountId,
    });
  }
}
