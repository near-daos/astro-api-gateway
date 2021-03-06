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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  AccountAccessGuard,
  AuthorizedRequest,
  BaseResponseDto,
} from '@sputnik-v2/common';
import {
  CreateDraftComment,
  DraftCommentResponse,
  DraftCommentService,
  DraftCommentsRequest,
  UpdateDraftComment,
} from '@sputnik-v2/draft-comment';
import { DeleteResult } from 'typeorm';

@ApiTags('Draft Comments')
@Controller('/draft-comments')
export class DraftCommentController {
  constructor(private readonly draftCommentService: DraftCommentService) {}

  @ApiResponse({
    status: 200,
    description: 'List of Draft Comments',
    type: DraftCommentResponse,
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
  updateDraftComment(
    @Param('id') id: string,
    @Req() req: AuthorizedRequest,
    @Body() body: UpdateDraftComment,
  ): Promise<string> {
    return this.draftCommentService.update(id, req.accountId, body);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
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
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/:id/like')
  likeDraftComment(
    @Param('id') id: string,
    @Req() req: AuthorizedRequest,
  ): Promise<boolean> {
    return this.draftCommentService.like(id, req.accountId);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
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
  @Post('/:id/unlike')
  unlikeDraftComment(
    @Param('id') id: string,
    @Req() req: AuthorizedRequest,
  ): Promise<boolean> {
    return this.draftCommentService.unlike(id, req.accountId);
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
      'Account <accountId> identity is invalid - public key / invalid signature / invalid accountId / not author or council',
  })
  @ApiNotFoundResponse({
    description: 'Draft comment <id> does not exist',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Delete('/:id')
  deleteDraftComment(
    @Param('id') id: string,
    @Req() req: AuthorizedRequest,
  ): Promise<DeleteResult> {
    return this.draftCommentService.delete(id, req.accountId);
  }
}
