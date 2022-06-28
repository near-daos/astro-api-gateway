import { Module } from '@nestjs/common';
import { DraftHashtagService } from './draft-hashtag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import { DraftHashtag } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([DraftHashtag], DRAFT_DB_CONNECTION)],
  providers: [DraftHashtagService],
  exports: [DraftHashtagService],
})
export class DraftHashtagModule {}
