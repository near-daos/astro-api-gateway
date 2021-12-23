import { BaseResponse } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';

import { Comment } from '../entities';

export class CommentResponse extends BaseResponse<Comment> {
  @ApiProperty({ type: [Comment] })
  data: Comment[];
}
