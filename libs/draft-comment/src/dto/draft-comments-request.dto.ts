import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { SearchDto } from '@sputnik-v2/common';
import { DraftCommentContextType } from '@sputnik-v2/draft-comment/types';

export class DraftCommentsRequest extends SearchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  contextId: string;

  @ApiProperty({ enum: DraftCommentContextType, required: false })
  @IsOptional()
  contextType: DraftCommentContextType;

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value ? value === 'true' : value))
  isReply: boolean;
}
