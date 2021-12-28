import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { COMMENT_DELETE_VOTES_REQUIRED } from '@sputnik-v2/common';
import { buildCommentReportId } from '@sputnik-v2/utils';

import { CommentReportDto } from './dto';
import { CommentReport } from './entities';
import { CommentService } from './comment.service';

@Injectable()
export class CommentReportService extends TypeOrmCrudService<CommentReport> {
  constructor(
    @InjectRepository(CommentReport)
    private readonly commentReportRepository: Repository<CommentReport>,
    private readonly commentService: CommentService,
  ) {
    super(commentReportRepository);
  }

  async create(commentReportDto: CommentReportDto): Promise<CommentReport> {
    const { commentId, accountId, reason } = commentReportDto;
    const commentReport = await this.commentReportRepository.save({
      id: buildCommentReportId(commentId, accountId),
      accountId,
      commentId,
      reason,
    });
    const commentReports = await this.commentReportRepository.find({
      commentId: commentId,
    });

    if (commentReports.length === COMMENT_DELETE_VOTES_REQUIRED) {
      await this.commentService.deleteById(commentId);
    }

    return commentReport;
  }
}
