import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Comment,
  CommentReport,
  CommentReportService,
  CommentService,
} from '@sputnik-v2/comment';
import { DaoModule } from '@sputnik-v2/dao';
import { ProposalModule } from '@sputnik-v2/proposal';
import { EventModule } from '@sputnik-v2/event';
import { BountyModule } from '@sputnik-v2/bounty';

import { NearModule } from '../near/near.module';
import { CommentsController } from './comment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentReport]),
    BountyModule,
    DaoModule,
    ProposalModule,
    EventModule,
    NearModule,
  ],
  controllers: [CommentsController],
  providers: [CommentService, CommentReportService],
  exports: [CommentService, CommentReportService],
})
export class CommentModule {}
