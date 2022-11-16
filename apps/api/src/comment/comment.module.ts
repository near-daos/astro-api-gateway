import { Module } from '@nestjs/common';
import { CommentModule as CommentModuleLib } from '@sputnik-v2/comment';
import { NearApiModule } from '@sputnik-v2/near-api';

import { CommentsController } from './comment.controller';

@Module({
  imports: [NearApiModule, CommentModuleLib],
  controllers: [CommentsController],
})
export class CommentModule {}
