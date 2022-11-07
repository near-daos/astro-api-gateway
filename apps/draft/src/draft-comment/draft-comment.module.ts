import { Module } from '@nestjs/common';

import { NearApiModule } from '@sputnik-v2/near-api';
import { DraftCommentModule as DraftCommentModuleLib } from '@sputnik-v2/draft-comment';

import { DraftCommentController } from './draft-comment.controller';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';

@Module({
  imports: [DraftCommentModuleLib, NearApiModule, FeatureFlagsModule],
  controllers: [DraftCommentController],
})
export class DraftCommentModule {}
