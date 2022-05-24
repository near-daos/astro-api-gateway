import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UseFilters,
  Get,
  Delete,
  Param,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CrudRequest, ParsedRequest } from '@nestjsx/crud';
import { ThrottlerGuard } from '@nestjs/throttler';

import {
  AccountAccessGuard,
  AuthorizedRequest,
  DeleteOneParams,
  EntityQuery,
  QueryFailedErrorFilter,
} from '@sputnik-v2/common';
import {
  Comment,
  CommentReport,
  CommentReportService,
  CommentService,
} from '@sputnik-v2/comment';
import {
  CommentReportDto,
  CommentDto,
  CommentResponse,
} from '@sputnik-v2/comment/dto';
import { CommentDeleteDto } from '@sputnik-v2/comment/dto/comment-delete.dto';

import { CommentCrudRequestInterceptor } from './interceptors/comment-crud.interceptor';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentReportService: CommentReportService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'List of Comments',
    type: CommentResponse,
  })
  @ApiQuery({ type: EntityQuery })
  @UseInterceptors(CommentCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @Get('/')
  async getComments(
    @ParsedRequest() query: CrudRequest,
  ): Promise<Comment[] | CommentResponse> {
    return await this.commentService.getMany(query);
  }

  @ApiResponse({
    status: 201,
    description: 'Created',
    type: Comment,
  })
  @ApiNotFoundResponse({
    description: `No Proposal '<commentDto.proposalIs>' found.`,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / Invalid signature',
  })
  @ApiBearerAuth()
  @UseGuards(ThrottlerGuard)
  @UseGuards(AccountAccessGuard)
  @Post('/')
  async create(
    @Req() req: AuthorizedRequest,
    @Body() commentDto: CommentDto,
  ): Promise<Comment> {
    return this.commentService.create(req.accountId, commentDto);
  }

  @ApiResponse({
    status: 201,
    description: 'Created',
    type: CommentReport,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key  / Invalid signature',
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Post('/report')
  async createCommentReport(
    @Req() req: AuthorizedRequest,
    @Body() commentDeleteVoteDto: CommentReportDto,
  ): Promise<CommentReport> {
    return this.commentReportService.create(
      req.accountId,
      commentDeleteVoteDto,
    );
  }

  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted',
    type: CommentReport,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / Invalid signature',
  })
  @ApiNotFoundResponse({
    description: `No Comment '<id>' found.`,
  })
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard)
  @Delete('/:id')
  async deleteComment(
    @Req() req: AuthorizedRequest,
    @Param() { id }: DeleteOneParams,
    @Body() deleteDto: CommentDeleteDto,
  ): Promise<Comment> {
    const comment = await this.commentService.deleteAsOwner(id, req.accountId);
    await this.commentReportService.create(req.accountId, {
      ...deleteDto,
      commentId: Number(id),
    });
    return comment;
  }
}
