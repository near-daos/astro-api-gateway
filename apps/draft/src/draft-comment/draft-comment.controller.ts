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
  FindOneMongoDaoParams,
} from '@sputnik-v2/common';
import {
  CreateDraftComment,
  DraftCommentResponse,
  DraftCommentsRequest,
  UpdateDraftComment,
  MongoDraftCommentService,
  DynamoDraftCommentService,
} from '@sputnik-v2/draft-comment';
import { DraftCommentPageResponse } from './dto/draft-comment-page-response.dto';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';

@Span()
@ApiTags('Draft Comments')
@Controller('/draft-comments')
export class DraftCommentController {
  constructor(
    private readonly draftCommentService: MongoDraftCommentService,
    private readonly dynamoDraftCommentService: DynamoDraftCommentService,
    private readonly featureFlagsService: FeatureFlagsService,
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
  async createDraftComment(
    @Req() req: AuthorizedRequest,
    @Body() body: CreateDraftComment,
  ): Promise<string> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.create(req.accountId, body);
    }

    return this.draftCommentService.create(req.accountId, body);
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
  @Patch('/:id')
  async updateDraftComment(
    @Param() { id, daoId }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
    @Body() body: UpdateDraftComment,
  ): Promise<string> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.update(
        daoId,
        id,
        req.accountId,
        body,
      );
    }

    return this.draftCommentService.update(daoId, id, req.accountId, body);
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
  @Post('/:id/like')
  async likeDraftComment(
    @Param() { daoId, id }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
  ): Promise<boolean> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.like(daoId, id, req.accountId);
    }
    return this.draftCommentService.like(daoId, id, req.accountId);
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
  @Post('/:id/remove-like')
  async removeLikeFromDraftComment(
    @Param() { daoId, id }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
  ): Promise<boolean> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.removeLike(
        daoId,
        id,
        req.accountId,
      );
    }
    return this.draftCommentService.removeLike(daoId, id, req.accountId);
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
  @Post('/:id/dislike')
  async dislikeDraftComment(
    @Param() { daoId, id }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
  ): Promise<boolean> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.dislike(daoId, id, req.accountId);
    }
    return this.draftCommentService.dislike(daoId, id, req.accountId);
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
  @Post('/:id/remove-dislike')
  async removeDislikeFromDraftComment(
    @Param() { daoId, id }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
  ): Promise<boolean> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.removeDislike(
        daoId,
        id,
        req.accountId,
      );
    }
    return this.draftCommentService.removeDislike(daoId, id, req.accountId);
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
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId / not author or council',
  })
  @ApiNotFoundResponse({
    description: 'Draft comment <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Delete('/:id')
  async deleteDraftComment(
    @Param() { daoId, id }: FindOneMongoDaoParams,
    @Req() req: AuthorizedRequest,
  ): Promise<DeleteResponse> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.delete(daoId, id, req.accountId);
    }

    return this.draftCommentService.delete(daoId, id, req.accountId);
  }
}
