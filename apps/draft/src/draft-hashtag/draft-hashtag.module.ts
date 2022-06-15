import { Module } from '@nestjs/common';

import { NearApiModule } from '@sputnik-v2/near-api';
import { DraftHashtagModule as DraftHashtagModuleLib } from '@sputnik-v2/draft-hashtag';

import { DraftHashtagController } from './draft-hashtag.controller';

@Module({
  imports: [DraftHashtagModuleLib, NearApiModule],
  controllers: [DraftHashtagController],
})
export class DraftHashtagModule {}
