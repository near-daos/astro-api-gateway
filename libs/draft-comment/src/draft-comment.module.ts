import { Module } from '@nestjs/common';
import { MongoDraftCommentService } from './mongo-draft-comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DraftProposalModule } from '@sputnik-v2/draft-proposal';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import { DraftComment } from '@sputnik-v2/draft-comment/entities';
import { EventModule } from '@sputnik-v2/event';
import { DaoApiModule } from '@sputnik-v2/dao-api';
import { DynamodbModule } from '@sputnik-v2/dynamodb';
import { DynamoDraftCommentService } from '@sputnik-v2/draft-comment/dynamo-draft-comment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DraftComment], DRAFT_DB_CONNECTION),
    DraftProposalModule,
    DaoApiModule,
    EventModule,
    DynamodbModule,
  ],
  providers: [DynamoDraftCommentService, MongoDraftCommentService],
  exports: [DynamoDraftCommentService, MongoDraftCommentService],
})
export class DraftCommentModule {}
