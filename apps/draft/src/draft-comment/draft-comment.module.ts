import { Module } from '@nestjs/common';

import { NearApiModule } from '@sputnik-v2/near-api';
import { DraftCommentModule as DraftCommentModuleLib } from '@sputnik-v2/draft-comment';

import { DraftCommentController } from './draft-comment.controller';

@Module({
  imports: [DraftCommentModuleLib, NearApiModule],
  controllers: [DraftCommentController],
})
export class DraftCommentModule {}
