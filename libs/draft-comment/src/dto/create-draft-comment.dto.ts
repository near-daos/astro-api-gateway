import { ApiProperty } from '@nestjs/swagger';
import { DraftCommentContextType } from '@sputnik-v2/draft-comment/types';

export class CreateDraftComment {
  @ApiProperty({ required: true })
  contextId: string;

  @ApiProperty({
    enum: DraftCommentContextType,
    required: true,
  })
  contextType: DraftCommentContextType;

  @ApiProperty({ required: true })
  message: string;

  @ApiProperty({ required: false })
  replyTo?: string;
}
