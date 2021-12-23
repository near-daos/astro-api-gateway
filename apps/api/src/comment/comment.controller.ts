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
} from '@nestjs/common';
import {
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
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @UseGuards(ThrottlerGuard)
  @UseGuards(AccountAccessGuard)
  @Post('/')
  async create(@Body() commentDto: CommentDto): Promise<Comment> {
    return this.commentService.create(commentDto);
  }

  @ApiResponse({
    status: 201,
    description: 'Created',
    type: CommentReport,
  })
  @ApiForbiddenResponse({
    description:
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @UseGuards(AccountAccessGuard)
  @Post('/report')
  async createCommentReport(
    @Body() commentDeleteVoteDto: CommentReportDto,
  ): Promise<CommentReport> {
    return this.commentReportService.create(commentDeleteVoteDto);
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
      'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature',
  })
  @ApiNotFoundResponse({
    description: `No Comment '<id>' found.`,
  })
  @UseGuards(AccountAccessGuard)
  @Delete('/:id')
  async deleteComment(
    @Param() { id }: DeleteOneParams,
    @Body() deleteDto: CommentDeleteDto,
  ): Promise<Comment> {
    const comment = await this.commentService.deleteAsOwner(
      id,
      deleteDto.accountId,
    );
    await this.commentReportService.create({
      ...deleteDto,
      commentId: Number(id),
    });
    return comment;
  }
}
