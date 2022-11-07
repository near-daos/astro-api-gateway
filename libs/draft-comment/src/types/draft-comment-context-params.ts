import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DraftCommentContextParams {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  daoId: string;
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  draftId: string;
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  commentId: string;
  accountId: string;
}
