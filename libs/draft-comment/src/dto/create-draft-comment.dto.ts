import { ApiProperty } from '@nestjs/swagger';
import { DraftCommentContextType } from '@sputnik-v2/draft-comment/types';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDraftComment {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  contextId: string;

  @ApiProperty({
    enum: DraftCommentContextType,
    required: true,
  })
  @IsEnum(DraftCommentContextType)
  @IsNotEmpty()
  contextType: DraftCommentContextType;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  replyTo?: string;
}
