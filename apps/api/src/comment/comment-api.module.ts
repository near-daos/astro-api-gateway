import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment, CommentModule, CommentReport } from '@sputnik-v2/comment';

import { NearModule } from '../near/near.module';
import { CommentsController } from './comment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentReport]),
    NearModule,
    CommentModule,
  ],
  controllers: [CommentsController],
})
export class CommentApiModule {}
