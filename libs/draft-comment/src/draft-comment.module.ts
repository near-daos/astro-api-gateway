import { Module } from '@nestjs/common';
import { DraftCommentService } from './draft-comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DraftProposalModule } from '@sputnik-v2/draft-proposal';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import { DraftComment } from '@sputnik-v2/draft-comment/entities';
import { EventModule } from '@sputnik-v2/event';
import { DaoApiModule } from '@sputnik-v2/dao-api';

@Module({
  imports: [
    TypeOrmModule.forFeature([DraftComment], DRAFT_DB_CONNECTION),
    DraftProposalModule,
    DaoApiModule,
    EventModule,
  ],
  providers: [DraftCommentService],
  exports: [DraftCommentService],
})
export class DraftCommentModule {}
