import { ApiProperty } from '@nestjs/swagger';
import { DraftComment } from '../entities';
import { DraftCommentContextType } from '@sputnik-v2/draft-comment/types';

export class DraftCommentResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  contextId: string;

  @ApiProperty({
    enum: DraftCommentContextType,
  })
  contextType: DraftCommentContextType;

  @ApiProperty()
  author: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  replyTo?: string;

  @ApiProperty({ type: [DraftCommentResponse] })
  replies?: DraftCommentResponse[];

  @ApiProperty({ type: [String] })
  likeAccounts: string[];

  @ApiProperty()
  createdAt: Date;
}

export function castDraftCommentResponse(
  draftComment: DraftComment,
  replies?: DraftComment[],
): DraftCommentResponse {
  const id = draftComment.id.toString();
  return {
    id,
    contextId: draftComment.contextId,
    contextType: draftComment.contextType,
    author: draftComment.author,
    message: draftComment.message,
    replyTo: draftComment.replyTo,
    replies: replies
      ?.filter((comment) => comment.replyTo === id)
      .map((comment) => castDraftCommentResponse(comment)),
    likeAccounts: draftComment.likeAccounts,
    createdAt: draftComment.createdAt,
  };
}
