import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalModule } from '@sputnik-v2/proposal';
import { EventModule } from '@sputnik-v2/event/event.module';

import { Comment, CommentReport } from './entities';
import { CommentService } from './comment.service';
import { CommentReportService } from './comment-report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentReport]),
    ProposalModule,
    EventModule,
  ],
  providers: [CommentService, CommentReportService],
  exports: [CommentService, CommentReportService],
})
export class CommentModule {}
