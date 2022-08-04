import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '@sputnik-v2/common';
import { DraftCommentResponse } from '@sputnik-v2/draft-comment';

export class DraftCommentPageResponse extends BaseResponseDto<DraftCommentResponse> {
  @ApiProperty({ type: [DraftCommentResponse] })
  data: DraftCommentResponse[];
}
